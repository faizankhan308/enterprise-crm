import express from "express";
import path from "path";
import { db } from "./server/db.js";
import { signJwt, verifyJwt, hashPassword, verifyPassword } from "./server/auth-jwt.js";
const app = express();
const PORT = 3e3;
app.use(express.json());
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized. Missing token." });
  }
  const token = authHeader.split(" ")[1];
  const decoded = verifyJwt(token);
  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized. Invalid or expired token." });
  }
  req.user = decoded;
  next();
}
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden. Insufficient system permissions." });
    }
    next();
  };
}
function notifyUser(userId, title, message, type) {
  const notification = {
    id: `nt-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
    userId,
    title,
    message,
    type,
    read: false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.notifications.unshift(notification);
  db.saveAll();
}
app.post("/api/auth/register", (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Email, password, and name are required." });
  }
  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "User with this email already exists." });
  }
  const selectedRole = role || "Sales Executive";
  const newUser = {
    id: `u-${Date.now()}`,
    email: email.toLowerCase(),
    name,
    passwordHash: hashPassword(password),
    role: selectedRole,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.users.push(newUser);
  db.saveAll();
  const token = signJwt({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name });
  res.status(201).json({
    token,
    user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }
  });
});
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  const token = signJwt({ id: user.id, email: user.email, role: user.role, name: user.name });
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});
app.get("/api/auth/me", authMiddleware, (req, res) => {
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt
  });
});
app.get("/api/leads", authMiddleware, (req, res) => {
  let filtered = [...db.leads];
  const { search, source, status, assignedTo, sortBy, order } = req.query;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (l) => l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.phone.toLowerCase().includes(q)
    );
  }
  if (source) {
    filtered = filtered.filter((l) => l.source === source);
  }
  if (status) {
    filtered = filtered.filter((l) => l.status === status);
  }
  if (assignedTo) {
    filtered = filtered.filter((l) => l.assignedTo === assignedTo);
  }
  if (sortBy) {
    const field = sortBy;
    const isAsc = order === "asc";
    filtered.sort((a, b) => {
      const valA = String(a[field] || "").toLowerCase();
      const valB = String(b[field] || "").toLowerCase();
      if (valA < valB) return isAsc ? -1 : 1;
      if (valA > valB) return isAsc ? 1 : -1;
      return 0;
    });
  } else {
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  res.json(filtered);
});
app.post("/api/leads", authMiddleware, (req, res) => {
  const { name, company, email, phone, source, status, assignedTo } = req.body;
  if (!name || !company || !email) {
    return res.status(400).json({ error: "Name, Company, and Email are required." });
  }
  const newLead = {
    id: `l-${Date.now()}`,
    name,
    company,
    email,
    phone: phone || "",
    source: source || "Website",
    status: status || "New",
    assignedTo: assignedTo || req.user.id,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.leads.push(newLead);
  db.saveAll();
  if (newLead.assignedTo !== req.user.id) {
    notifyUser(
      newLead.assignedTo,
      "New Lead Assignment",
      `Lead "${newLead.name}" from ${newLead.company} has been assigned to you by ${req.user.name}.`,
      "Assignment"
    );
  }
  const activity = {
    id: `act-${Date.now()}`,
    targetType: "lead",
    targetId: newLead.id,
    type: "Note",
    title: "Lead Created",
    description: `Lead registered via CRM by ${req.user.name}.`,
    date: (/* @__PURE__ */ new Date()).toISOString(),
    createdBy: req.user.id,
    createdByName: req.user.name
  };
  db.activities.unshift(activity);
  db.saveAll();
  res.status(201).json(newLead);
});
app.put("/api/leads/:id", authMiddleware, (req, res) => {
  const leadIndex = db.leads.findIndex((l) => l.id === req.params.id);
  if (leadIndex === -1) {
    return res.status(404).json({ error: "Lead not found." });
  }
  const oldLead = db.leads[leadIndex];
  const { name, company, email, phone, source, status, assignedTo } = req.body;
  const updatedLead = {
    ...oldLead,
    name: name !== void 0 ? name : oldLead.name,
    company: company !== void 0 ? company : oldLead.company,
    email: email !== void 0 ? email : oldLead.email,
    phone: phone !== void 0 ? phone : oldLead.phone,
    source: source !== void 0 ? source : oldLead.source,
    status: status !== void 0 ? status : oldLead.status,
    assignedTo: assignedTo !== void 0 ? assignedTo : oldLead.assignedTo,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.leads[leadIndex] = updatedLead;
  if (assignedTo && assignedTo !== oldLead.assignedTo) {
    notifyUser(
      assignedTo,
      "Lead Assigned To You",
      `Lead "${updatedLead.name}" has been transferred to you.`,
      "Assignment"
    );
  }
  if (status && status !== oldLead.status) {
    const activity = {
      id: `act-${Date.now()}`,
      targetType: "lead",
      targetId: updatedLead.id,
      type: "Status Change",
      title: "Status Updated",
      description: `Lead status changed from "${oldLead.status}" to "${status}" by ${req.user.name}.`,
      date: (/* @__PURE__ */ new Date()).toISOString(),
      createdBy: req.user.id,
      createdByName: req.user.name
    };
    db.activities.unshift(activity);
  }
  db.saveAll();
  res.json(updatedLead);
});
app.delete("/api/leads/:id", authMiddleware, requireRole(["Admin", "Sales Manager"]), (req, res) => {
  const idx = db.leads.findIndex((l) => l.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: "Lead not found." });
  }
  db.leads.splice(idx, 1);
  db.saveAll();
  res.json({ success: true, message: "Lead safely deleted." });
});
app.post("/api/leads/:id/convert", authMiddleware, (req, res) => {
  const leadIdx = db.leads.findIndex((l) => l.id === req.params.id);
  if (leadIdx === -1) {
    return res.status(404).json({ error: "Lead not found." });
  }
  const lead = db.leads[leadIdx];
  const newCustomer = {
    id: `c-${Date.now()}`,
    leadId: lead.id,
    name: lead.name,
    company: lead.company,
    email: lead.email,
    phone: lead.phone,
    purchaseHistory: [],
    notes: [`Converted from Lead on ${(/* @__PURE__ */ new Date()).toLocaleDateString()} by ${req.user.name}.`],
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.customers.push(newCustomer);
  lead.status = "Qualified";
  lead.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  const act = {
    id: `act-${Date.now()}`,
    targetType: "customer",
    targetId: newCustomer.id,
    type: "Status Change",
    title: "Lead Converted",
    description: `Successfully converted lead "${lead.name}" from ${lead.company} to official Customer database.`,
    date: (/* @__PURE__ */ new Date()).toISOString(),
    createdBy: req.user.id,
    createdByName: req.user.name
  };
  db.activities.unshift(act);
  db.deals.forEach((deal) => {
    if (deal.leadId === lead.id) {
      deal.stage = "Qualified";
      deal.probability = 40;
      deal.expectedRevenue = deal.value * 0.4;
      deal.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    }
  });
  db.saveAll();
  res.status(201).json({ customer: newCustomer, lead });
});
app.get("/api/deals", authMiddleware, (req, res) => {
  res.json(db.deals);
});
app.post("/api/deals", authMiddleware, (req, res) => {
  const { name, value, stage, leadId, assignedTo } = req.body;
  if (!name || value === void 0 || !stage) {
    return res.status(400).json({ error: "Name, Value, and Stage are required." });
  }
  let probability = 10;
  if (stage === "Contacted") probability = 20;
  if (stage === "Qualified") probability = 40;
  if (stage === "Proposal Sent") probability = 60;
  if (stage === "Negotiation") probability = 80;
  if (stage === "Won") probability = 100;
  if (stage === "Lost") probability = 0;
  const expectedRevenue = Number(value) * (probability / 100);
  const newDeal = {
    id: `d-${Date.now()}`,
    name,
    value: Number(value),
    stage,
    probability,
    leadId: leadId || "",
    assignedTo: assignedTo || req.user.id,
    expectedRevenue,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.deals.push(newDeal);
  if (leadId) {
    const isCustomer = leadId.startsWith("c-");
    const activity = {
      id: `act-${Date.now()}`,
      targetType: isCustomer ? "customer" : "lead",
      targetId: leadId,
      type: "Status Change",
      title: "Deal Pipeline Initialized",
      description: `New Deal "${name}" ($${Number(value).toLocaleString()}) launched in stage ${stage} by ${req.user.name}.`,
      date: (/* @__PURE__ */ new Date()).toISOString(),
      createdBy: req.user.id,
      createdByName: req.user.name
    };
    db.activities.unshift(activity);
  }
  db.saveAll();
  res.status(201).json(newDeal);
});
app.put("/api/deals/stage", authMiddleware, (req, res) => {
  const { dealId, stage } = req.body;
  if (!dealId || !stage) {
    return res.status(400).json({ error: "dealId and stage are required." });
  }
  const dealIdx = db.deals.findIndex((d) => d.id === dealId);
  if (dealIdx === -1) {
    return res.status(404).json({ error: "Deal not found." });
  }
  const deal = db.deals[dealIdx];
  const oldStage = deal.stage;
  deal.stage = stage;
  let probability = 10;
  if (stage === "New Lead") probability = 10;
  if (stage === "Contacted") probability = 20;
  if (stage === "Qualified") probability = 40;
  if (stage === "Proposal Sent") probability = 60;
  if (stage === "Negotiation") probability = 80;
  if (stage === "Won") probability = 100;
  if (stage === "Lost") probability = 0;
  deal.probability = probability;
  deal.expectedRevenue = deal.value * (probability / 100);
  deal.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  if (stage === "Won" && oldStage !== "Won") {
    db.users.filter((u) => u.role === "Admin" || u.role === "Sales Manager").forEach((mgr) => {
      notifyUser(
        mgr.id,
        "Deal Won Alert! \u{1F389}",
        `Sales Rep "${req.user.name}" won the deal "${deal.name}" worth $${deal.value.toLocaleString()}!`,
        "StageChange"
      );
    });
    if (deal.leadId && deal.leadId.startsWith("c-")) {
      const cust = db.customers.find((c) => c.id === deal.leadId);
      if (cust) {
        cust.purchaseHistory.push({
          itemId: deal.id,
          itemName: deal.name,
          amount: deal.value,
          date: (/* @__PURE__ */ new Date()).toISOString()
        });
        cust.notes.unshift(`Automatic: Closed Won Deal "${deal.name}" of $${deal.value.toLocaleString()}`);
      }
    }
  }
  if (deal.leadId) {
    const isCustomer = deal.leadId.startsWith("c-");
    const act = {
      id: `act-${Date.now()}`,
      targetType: isCustomer ? "customer" : "lead",
      targetId: deal.leadId,
      type: "Status Change",
      title: "Deal Stage Updated",
      description: `Deal "${deal.name}" shifted stage from "${oldStage}" to "${stage}" by ${req.user.name}.`,
      date: (/* @__PURE__ */ new Date()).toISOString(),
      createdBy: req.user.id,
      createdByName: req.user.name
    };
    db.activities.unshift(act);
  }
  db.saveAll();
  res.json({ success: true, deal });
});
app.put("/api/deals/:id", authMiddleware, (req, res) => {
  const idx = db.deals.findIndex((d) => d.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: "Deal not found." });
  }
  const oldDeal = db.deals[idx];
  const { name, value, stage, probability, assignedTo, leadId } = req.body;
  const newVal = value !== void 0 ? Number(value) : oldDeal.value;
  let newProb = probability !== void 0 ? Number(probability) : oldDeal.probability;
  if (stage && stage !== oldDeal.stage && probability === void 0) {
    if (stage === "New Lead") newProb = 10;
    else if (stage === "Contacted") newProb = 20;
    else if (stage === "Qualified") newProb = 40;
    else if (stage === "Proposal Sent") newProb = 60;
    else if (stage === "Negotiation") newProb = 80;
    else if (stage === "Won") newProb = 100;
    else if (stage === "Lost") newProb = 0;
  }
  const updatedDeal = {
    ...oldDeal,
    name: name !== void 0 ? name : oldDeal.name,
    value: newVal,
    stage: stage !== void 0 ? stage : oldDeal.stage,
    probability: newProb,
    assignedTo: assignedTo !== void 0 ? assignedTo : oldDeal.assignedTo,
    leadId: leadId !== void 0 ? leadId : oldDeal.leadId,
    expectedRevenue: newVal * (newProb / 100),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.deals[idx] = updatedDeal;
  db.saveAll();
  res.json(updatedDeal);
});
app.delete("/api/deals/:id", authMiddleware, requireRole(["Admin", "Sales Manager"]), (req, res) => {
  const index = db.deals.findIndex((d) => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Deal not found." });
  }
  db.deals.splice(index, 1);
  db.saveAll();
  res.json({ success: true, message: "Deal removed from sales pipeline." });
});
app.get("/api/customers", authMiddleware, (req, res) => {
  res.json(db.customers);
});
app.get("/api/customers/:id", authMiddleware, (req, res) => {
  const customer = db.customers.find((c) => c.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ error: "Customer not found." });
  }
  res.json(customer);
});
app.post("/api/customers", authMiddleware, (req, res) => {
  const { name, company, email, phone, notes } = req.body;
  if (!name || !company || !email) {
    return res.status(400).json({ error: "Name, Company, and Email are required." });
  }
  const newCustomer = {
    id: `c-${Date.now()}`,
    name,
    company,
    email,
    phone: phone || "",
    purchaseHistory: [],
    notes: notes ? [notes] : [],
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.customers.push(newCustomer);
  db.saveAll();
  res.status(201).json(newCustomer);
});
app.put("/api/customers/:id", authMiddleware, (req, res) => {
  const customerIdx = db.customers.findIndex((c) => c.id === req.params.id);
  if (customerIdx === -1) {
    return res.status(404).json({ error: "Customer not found." });
  }
  const oldData = db.customers[customerIdx];
  const { name, company, email, phone, notes, purchaseHistory } = req.body;
  let existingNotes = [...oldData.notes];
  if (notes) {
    existingNotes.unshift(notes);
  }
  const updatedCustomer = {
    ...oldData,
    name: name !== void 0 ? name : oldData.name,
    company: company !== void 0 ? company : oldData.company,
    email: email !== void 0 ? email : oldData.email,
    phone: phone !== void 0 ? phone : oldData.phone,
    purchaseHistory: purchaseHistory !== void 0 ? purchaseHistory : oldData.purchaseHistory,
    notes: existingNotes
  };
  db.customers[customerIdx] = updatedCustomer;
  db.saveAll();
  res.json(updatedCustomer);
});
app.delete("/api/customers/:id", authMiddleware, requireRole(["Admin"]), (req, res) => {
  const idx = db.customers.findIndex((c) => c.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: "Customer not found." });
  }
  db.customers.splice(idx, 1);
  db.saveAll();
  res.json({ success: true, message: "Customer record successfully deleted." });
});
app.get("/api/activities", authMiddleware, (req, res) => {
  const { targetType, targetId } = req.query;
  let filtered = [...db.activities];
  if (targetType) {
    filtered = filtered.filter((a) => a.targetType === targetType);
  }
  if (targetId) {
    filtered = filtered.filter((a) => a.targetId === targetId);
  }
  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json(filtered);
});
app.post("/api/activities", authMiddleware, (req, res) => {
  const { targetType, targetId, type, title, description, reminderDate } = req.body;
  if (!targetType || !targetId || !type || !title) {
    return res.status(400).json({ error: "targetType, targetId, type, and title are required." });
  }
  const newActivity = {
    id: `act-${Date.now()}`,
    targetType,
    targetId,
    type,
    title,
    description: description || "",
    date: (/* @__PURE__ */ new Date()).toISOString(),
    createdBy: req.user.id,
    createdByName: req.user.name,
    reminderDate: reminderDate || void 0,
    reminderDone: reminderDate ? false : void 0
  };
  db.activities.unshift(newActivity);
  if (reminderDate) {
    notifyUser(
      req.user.id,
      "Reminder Created",
      `Follow-up reminder "${title}" registered for ${new Date(reminderDate).toLocaleDateString()}`,
      "Reminder"
    );
  }
  db.saveAll();
  res.status(201).json(newActivity);
});
app.put("/api/activities/:id", authMiddleware, (req, res) => {
  const idx = db.activities.findIndex((a) => a.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: "Activity not found." });
  }
  const { reminderDone } = req.body;
  if (reminderDone !== void 0) {
    db.activities[idx].reminderDone = reminderDone;
  }
  db.saveAll();
  res.json(db.activities[idx]);
});
app.delete("/api/activities/:id", authMiddleware, (req, res) => {
  const idx = db.activities.findIndex((a) => a.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: "Activity not found." });
  }
  db.activities.splice(idx, 1);
  db.saveAll();
  res.json({ success: true });
});
app.get("/api/emails", authMiddleware, (req, res) => {
  res.json(db.emails);
});
app.get("/api/email-templates", authMiddleware, (req, res) => {
  const templates = [
    {
      id: "temp-01",
      name: "Initial Product Intro",
      subject: "Elevate your system architecture with Acme Cloud",
      body: "Hi {{name}},\n\nI was reviewing {{company}}'s current digital workflow and noticed potential scaling bottlenecks. Acme integration services specialize in reducing downtime by 34%.\n\nAre you available next Tuesday for a brief 10-minute preview?\n\nSincerely,\n{{sender}}"
    },
    {
      id: "temp-02",
      name: "Meeting Follow Up",
      subject: "Thank you for your time / Next Steps",
      body: "Dear {{name}},\n\nThank you for taking the time to share {{company}}'s goals today. Based on our conversation, I recommend looking at our enterprise SLA package.\n\nLet me know if you would like me to prepare a custom quote.\n\nWarm regards,\n{{sender}}"
    },
    {
      id: "temp-03",
      name: "Contract Signature Request",
      subject: "Acme Services Partnership Agreement",
      body: "Hello {{name}},\n\nWe have finalized the SLA details in the partnership agreement. Please review the enclosed PDF contract and sign electronically at your earliest convenience.\n\nIf you have any feedback or revisions, I am happy to hop on a call.\n\nBest,\n{{sender}}"
    }
  ];
  res.json(templates);
});
app.post("/api/emails", authMiddleware, (req, res) => {
  const { to, subject, body, targetId, targetType, templateId } = req.body;
  if (!to || !subject || !body) {
    return res.status(400).json({ error: "Recipient address (to), subject, and body are required." });
  }
  const log = {
    id: `em-${Date.now()}`,
    sender: req.user.email,
    to,
    subject,
    body,
    templateId: templateId || void 0,
    sentAt: (/* @__PURE__ */ new Date()).toISOString(),
    sentBy: req.user.id
  };
  db.emails.unshift(log);
  if (targetId && targetType) {
    const act = {
      id: `act-${Date.now()}`,
      targetType,
      targetId,
      type: "Email",
      title: `Sent Email: ${subject}`,
      description: body.substring(0, 200) + (body.length > 200 ? "..." : ""),
      date: (/* @__PURE__ */ new Date()).toISOString(),
      createdBy: req.user.id,
      createdByName: req.user.name
    };
    db.activities.unshift(act);
  }
  db.saveAll();
  res.status(201).json(log);
});
app.get("/api/notifications", authMiddleware, (req, res) => {
  const userNotes = db.notifications.filter((n) => n.userId === req.user.id);
  res.json(userNotes);
});
app.put("/api/notifications/:id/read", authMiddleware, (req, res) => {
  const index = db.notifications.findIndex((n) => n.id === req.params.id && n.userId === req.user.id);
  if (index !== -1) {
    db.notifications[index].read = true;
    db.saveAll();
    return res.json(db.notifications[index]);
  }
  res.status(404).json({ error: "Notification not found." });
});
app.get("/api/analytics/dashboard", authMiddleware, (req, res) => {
  const totalLeads = db.leads.length;
  const activeDeals = db.deals.filter((d) => d.stage !== "Won" && d.stage !== "Lost");
  const activeDealsCount = activeDeals.length;
  const wonDeals = db.deals.filter((d) => d.stage === "Won");
  const wonRevenue = wonDeals.reduce((sum, d) => sum + d.value, 0);
  const totalRevenueForecast = db.deals.reduce((sum, d) => sum + d.expectedRevenue, 0);
  const leadConversionRate = totalLeads > 0 ? Math.round(db.customers.length / (totalLeads + db.customers.length) * 100) : 0;
  const monthlyPerf = [
    { name: "Jan", sales: 15e3, target: 8e4 },
    { name: "Feb", sales: 48e3, target: 8e4 },
    { name: "Mar", sales: 48e3, target: 8e4 },
    // Skyward deal
    { name: "Apr", sales: 3e4, target: 1e5 },
    { name: "May", sales: 24e3, target: 1e5 },
    // Chronos deal
    { name: "Jun", sales: 12e4, target: 12e3 }
    // Simulating large recent pipeline closures
  ];
  const juneWon = wonDeals.filter((d) => new Date(d.updatedAt).getMonth() === 5 && new Date(d.updatedAt).getFullYear() === 2026);
  const juneSum = juneWon.reduce((sum, d) => sum + d.value, 0);
  monthlyPerf[5].sales = juneSum > 0 ? juneSum : 12e4;
  const sources = ["Website", "Referral", "Cold Call", "Social Media", "Partner", "Other"];
  const leadSourceLogs = sources.map((source) => {
    return {
      name: source,
      value: db.leads.filter((l) => l.source === source).length
    };
  }).filter((item) => item.value > 0);
  const repsMap = {};
  db.users.forEach((u) => {
    repsMap[u.id] = { name: u.name, total: 0, count: 0 };
  });
  wonDeals.forEach((deal) => {
    if (repsMap[deal.assignedTo]) {
      repsMap[deal.assignedTo].total += deal.value;
      repsMap[deal.assignedTo].count += 1;
    }
  });
  const topReps = Object.values(repsMap).sort((a, b) => b.total - a.total).slice(0, 5);
  res.json({
    totalLeads,
    activeDeals: activeDealsCount,
    wonRevenue,
    revenueForecast: Math.round(totalRevenueForecast),
    conversionRate: leadConversionRate,
    monthlyPerformance: monthlyPerf,
    leadSourceDistribution: leadSourceLogs,
    topSalesReps: topReps,
    companyName: db.settings.companyName,
    monthlyRevenueTarget: db.settings.monthlyRevenueTarget
  });
});
app.get("/api/reports", authMiddleware, (req, res) => {
  res.json(db.reports);
});
app.post("/api/reports/generate", authMiddleware, (req, res) => {
  const { title, type } = req.body;
  if (!title || !type) {
    return res.status(400).json({ error: "Report title and type are required." });
  }
  let dataSummary = {};
  if (type === "Sales") {
    const deals = db.deals;
    const won = deals.filter((d) => d.stage === "Won");
    const pipeline = deals.filter((d) => d.stage !== "Won" && d.stage !== "Lost");
    dataSummary = {
      totalDeals: deals.length,
      wonCount: won.length,
      wonTotalRevenue: won.reduce((sum, d) => sum + d.value, 0),
      pipelineCount: pipeline.length,
      pipelineTotalValue: pipeline.reduce((sum, d) => sum + d.value, 0)
    };
  } else if (type === "LeadSource") {
    const sources = ["Website", "Referral", "Cold Call", "Social Media", "Partner", "Other"];
    dataSummary = sources.reduce((acc, src) => {
      acc[src] = db.leads.filter((l) => l.source === src).length;
      return acc;
    }, {});
  } else if (type === "Conversion") {
    const leads = db.leads.length;
    const customers = db.customers.length;
    dataSummary = {
      unconvertedLeads: db.leads.filter((l) => l.status !== "Qualified").length,
      convertedLeads: db.leads.filter((l) => l.status === "Qualified").length,
      totalCustomers: customers,
      calculatedRatePercentage: leads > 0 ? Math.round(customers / (leads + customers) * 100) : 100
    };
  } else if (type === "Revenue") {
    dataSummary = {
      currentWonRevenue: db.deals.filter((d) => d.stage === "Won").reduce((sum, d) => sum + d.value, 0),
      expectedPipelineForecast: db.deals.reduce((sum, d) => sum + d.expectedRevenue, 0),
      targetValue: db.settings.monthlyRevenueTarget
    };
  }
  const newReport = {
    id: `rep-${Date.now()}`,
    title,
    type,
    createdBy: req.user.name,
    criteria: req.body.criteria || {},
    generatedData: dataSummary,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.reports.unshift(newReport);
  db.saveAll();
  res.status(201).json(newReport);
});
app.get("/api/reports/:id/export", authMiddleware, (req, res) => {
  const report = db.reports.find((r) => r.id === req.params.id);
  if (!report) {
    return res.status(404).json({ error: "Report not found" });
  }
  let csv = `Report: ${report.title}
Type: ${report.type}
Generated By: ${report.createdBy}
Date: ${report.createdAt}

`;
  csv += `Metric,Value
`;
  const data = report.generatedData;
  Object.keys(data).forEach((key) => {
    csv += `"${key}","${data[key]}"
`;
  });
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="CRM-Report-${report.id}.csv"`);
  res.send(csv);
});
app.get("/api/admin/users", authMiddleware, requireRole(["Admin", "Sales Manager"]), (req, res) => {
  const sanitized = db.users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt
  }));
  res.json(sanitized);
});
app.put("/api/admin/users/:id/role", authMiddleware, requireRole(["Admin"]), (req, res) => {
  const { role } = req.body;
  if (!role || !["Admin", "Sales Manager", "Sales Executive"].includes(role)) {
    return res.status(400).json({ error: "Valid Role is required." });
  }
  const userIdx = db.users.findIndex((u) => u.id === req.params.id);
  if (userIdx === -1) {
    return res.status(404).json({ error: "User not found." });
  }
  db.users[userIdx].role = role;
  db.saveAll();
  notifyUser(
    req.params.id,
    "System Role updated",
    `Your application privileges have been elevated/updated to: ${role}`,
    "System"
  );
  res.json({ success: true, user: { id: db.users[userIdx].id, name: db.users[userIdx].name, role: db.users[userIdx].role } });
});
app.delete("/api/admin/users/:id", authMiddleware, requireRole(["Admin"]), (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: "You cannot delete your own administrative account." });
  }
  const index = db.users.findIndex((u) => u.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "User not found." });
  }
  db.users.splice(index, 1);
  db.saveAll();
  res.json({ success: true, message: "User database record purged successfully." });
});
app.get("/api/admin/settings", authMiddleware, (req, res) => {
  res.json(db.settings);
});
app.put("/api/admin/settings", authMiddleware, requireRole(["Admin", "Sales Manager"]), (req, res) => {
  const { companyName, currency, leadConversionRateTarget, monthlyRevenueTarget } = req.body;
  if (companyName) db.settings.companyName = companyName;
  if (currency) db.settings.currency = currency;
  if (leadConversionRateTarget !== void 0) db.settings.leadConversionRateTarget = Number(leadConversionRateTarget);
  if (monthlyRevenueTarget !== void 0) db.settings.monthlyRevenueTarget = Number(monthlyRevenueTarget);
  db.saveAll();
  res.json(db.settings);
});
async function startServer() {
  if (process.env.NODE_ENV === "production") {
    const distPath = path.resolve(process.cwd(), "../frontend/dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    app.get("/", (req, res) => {
      res.json({ status: "ok", message: "Enterprise CRM Backend API is running." });
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Enterprise CRM REST Service listening on http://0.0.0.0:${PORT}`);
  });
}
startServer();
