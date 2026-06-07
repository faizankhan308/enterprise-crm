import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');

// Simple helper to hash default passwords on start
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Ensure database directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class DB {
  users = [];
  leads = [];
  customers = [];
  deals = [];
  activities = [];
  emails = [];
  notifications = [];
  reports = [];
  settings = null;

  constructor() {
    this.loadAll();
    if (this.users.length === 0) {
      this.seedData();
    }
  }

  loadTable(fileName, fallback) {
    const file = path.join(DATA_DIR, fileName);
    if (fs.existsSync(file)) {
      try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
      } catch (err) {
        console.error(`Error loading database file ${fileName}:`, err);
        return fallback;
      }
    }
    return fallback;
  }

  saveTable(fileName, data) {
    const file = path.join(DATA_DIR, fileName);
    try {
      fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error(`Error saving database file ${fileName}:`, err);
    }
  }

  loadAll() {
    this.users = this.loadTable('users.json', []);
    this.leads = this.loadTable('leads.json', []);
    this.customers = this.loadTable('customers.json', []);
    this.deals = this.loadTable('deals.json', []);
    this.activities = this.loadTable('activities.json', []);
    this.emails = this.loadTable('emails.json', []);
    this.notifications = this.loadTable('notifications.json', []);
    this.reports = this.loadTable('reports.json', []);
    
    const defaultSettings = {
      companyName: "Acme Enterprises Inc.",
      currency: "USD",
      leadConversionRateTarget: 30,
      monthlyRevenueTarget: 150000
    };
    this.settings = this.loadTable('settings.json', [defaultSettings])[0] || defaultSettings;
  }

  saveAll() {
    this.saveTable('users.json', this.users);
    this.saveTable('leads.json', this.leads);
    this.saveTable('customers.json', this.customers);
    this.saveTable('deals.json', this.deals);
    this.saveTable('activities.json', this.activities);
    this.saveTable('emails.json', this.emails);
    this.saveTable('notifications.json', this.notifications);
    this.saveTable('reports.json', this.reports);
    this.saveTable('settings.json', [this.settings]);
  }

  seedData() {
    console.log("Seeding CRM Database with enterprise-grade sample records...");

    const adminId = 'u-admin-01';
    const managerId = 'u-manager-01';
    const exec1Id = 'u-exec-01';
    const exec2Id = 'u-exec-02';

    // Seed Users
    this.users = [
      {
        id: adminId,
        email: 'admin@crm.com',
        name: 'Sarah Jenkins',
        passwordHash: hashPassword('admin123'),
        role: 'Admin',
        createdAt: new Date('2026-01-10T09:00:00Z').toISOString()
      },
      {
        id: managerId,
        email: 'manager@crm.com',
        name: 'Marcus Vance',
        passwordHash: hashPassword('manager123'),
        role: 'Sales Manager',
        createdAt: new Date('2026-01-15T10:00:00Z').toISOString()
      },
      {
        id: exec1Id,
        email: 'executive1@crm.com',
        name: 'Elena Rostova',
        passwordHash: hashPassword('sales123'),
        role: 'Sales Executive',
        createdAt: new Date('2026-02-01T08:30:00Z').toISOString()
      },
      {
        id: exec2Id,
        email: 'executive2@crm.com',
        name: 'Jordan Chase',
        passwordHash: hashPassword('sales123'),
        role: 'Sales Executive',
        createdAt: new Date('2026-02-05T09:15:00Z').toISOString()
      }
    ];

    // Seed Leads
    this.leads = [
      {
        id: 'l-01',
        name: 'Robert Chen',
        company: 'Veloce Logistics',
        email: 'r.chen@velocelogistics.com',
        phone: '+1 (555) 489-3011',
        source: 'Website',
        status: 'Qualified',
        assignedTo: exec1Id,
        createdAt: new Date('2026-05-15T10:20:00Z').toISOString(),
        updatedAt: new Date('2026-06-01T14:30:00Z').toISOString()
      },
      {
        id: 'l-02',
        name: 'Jessica Fowler',
        company: 'Apex Health Systems',
        email: 'jfowler@apexhealth.org',
        phone: '+1 (555) 302-8877',
        source: 'Partner',
        status: 'Contacted',
        assignedTo: exec2Id,
        createdAt: new Date('2026-05-18T11:45:00Z').toISOString(),
        updatedAt: new Date('2026-05-20T16:00:00Z').toISOString()
      },
      {
        id: 'l-03',
        name: 'David Vance',
        company: 'Core Solutions Co',
        email: 'd.vance@coresolutions.net',
        phone: '+1 (555) 712-4091',
        source: 'Cold Call',
        status: 'New',
        assignedTo: exec1Id,
        createdAt: new Date('2026-06-05T09:00:00Z').toISOString(),
        updatedAt: new Date('2026-06-05T09:00:00Z').toISOString()
      },
      {
        id: 'l-04',
        name: 'Amanda Lin',
        company: 'Vertex Media Group',
        email: 'alin@vertexmedia.com',
        phone: '+1 (555) 902-1209',
        source: 'Social Media',
        status: 'Qualified',
        assignedTo: exec2Id,
        createdAt: new Date('2026-05-10T14:00:00Z').toISOString(),
        updatedAt: new Date('2026-05-28T11:00:00Z').toISOString()
      },
      {
        id: 'l-05',
        name: 'Michael Sterling',
        company: 'Sterling Capital',
        email: 'm.sterling@sterlingcap.com',
        phone: '+1 (555) 123-4567',
        source: 'Referral',
        status: 'New',
        assignedTo: exec2Id,
        createdAt: new Date('2026-06-06T15:20:00Z').toISOString(),
        updatedAt: new Date('2026-06-06T15:20:00Z').toISOString()
      },
      {
        id: 'l-06',
        name: 'Karla Wagner',
        company: 'Dravus Automobiles',
        email: 'k.wagner@dravus.de',
        phone: '+49 89 201948',
        source: 'Partner',
        status: 'Unqualified',
        assignedTo: exec1Id,
        createdAt: new Date('2026-05-01T10:00:00Z').toISOString(),
        updatedAt: new Date('2026-05-15T15:00:00Z').toISOString()
      }
    ];

    // Seed Customers (already converted Leads or direct customers)
    this.customers = [
      {
        id: 'c-01',
        leadId: 'l-converted-01',
        name: 'Nate Robinson',
        company: 'Skyward Enterprises',
        email: 'nate@skywardent.com',
        phone: '+1 (555) 890-4411',
        purchaseHistory: [
          { itemId: 'p-01', itemName: 'SaaS Enterprise license', amount: 48000, date: '2026-03-12T10:00:00Z' },
          { itemId: 'p-02', itemName: 'Custom SLA Consulting Bundle', amount: 12000, date: '2026-04-05T14:30:00Z' }
        ],
        notes: [
          'Excellent collaborator. Highly interested in API extensions in Q3.',
          'Consistently pays invoices on Net-15 terms.'
        ],
        createdAt: new Date('2026-02-14T08:00:00Z').toISOString()
      },
      {
        id: 'c-02',
        leadId: 'l-converted-02',
        name: 'Clara Oswald',
        company: 'Chronos Laboratories',
        email: 'clara@chronoslavs.org',
        phone: '+1 (555) 111-9988',
        purchaseHistory: [
          { itemId: 'p-01', itemName: 'SaaS Professional License (50 users)', amount: 24000, date: '2026-05-02T11:00:00Z' }
        ],
        notes: [
          'Required standard HIPAA compliant agreement during negotiations.',
          'Assigned primary manager as Marcus Vance.'
        ],
        createdAt: new Date('2026-04-20T09:45:00Z').toISOString()
      },
      {
        id: 'c-03',
        leadId: 'l-converted-03',
        name: 'Zane Thompson',
        company: 'Elysium Digital',
        email: 'zane@elysium.co',
        phone: '+1 (555) 345-6712',
        purchaseHistory: [
          { itemId: 'p-03', itemName: 'Migration Setup & Dedicated Hosting', amount: 15000, date: '2026-05-25T16:00:00Z' }
        ],
        notes: [
          'Converting from old Salesforce installation.',
          'Completed sandbox sandbox setup on May 20.'
        ],
        createdAt: new Date('2026-05-12T13:00:00Z').toISOString()
      }
    ];

    // Seed Deals (The Pipeline Items)
    this.deals = [
      {
        id: 'd-01',
        name: 'Cloud Expansion Proposal',
        value: 75000,
        stage: 'Proposal Sent',
        probability: 60,
        leadId: 'l-01', // Robert Chen - Veloce Logistics
        assignedTo: exec1Id,
        expectedRevenue: 45000,
        createdAt: new Date('2026-05-16T12:00:00Z').toISOString(),
        updatedAt: new Date('2026-06-03T11:00:00Z').toISOString()
      },
      {
        id: 'd-02',
        name: 'Strategic CRM Integration',
        value: 120000,
        stage: 'Negotiation',
        probability: 80,
        leadId: 'l-04', // Amanda Lin - Vertex Media Group
        assignedTo: exec2Id,
        expectedRevenue: 96000,
        createdAt: new Date('2026-05-12T09:30:00Z').toISOString(),
        updatedAt: new Date('2026-06-04T16:45:00Z').toISOString()
      },
      {
        id: 'd-03',
        name: 'Health Records Pilot Server',
        value: 45000,
        stage: 'Contacted',
        probability: 25,
        leadId: 'l-02', // Jessica Fowler - Apex Health Systems
        assignedTo: exec2Id,
        expectedRevenue: 11250,
        createdAt: new Date('2026-05-19T14:00:00Z').toISOString(),
        updatedAt: new Date('2026-05-22T10:00:00Z').toISOString()
      },
      {
        id: 'd-04',
        name: 'Core SaaS Migration Consult',
        value: 30000,
        stage: 'New Lead',
        probability: 10,
        leadId: 'l-03', // David Vance - Core Solutions Co
        assignedTo: exec1Id,
        expectedRevenue: 3000,
        createdAt: new Date('2026-06-05T09:15:00Z').toISOString(),
        updatedAt: new Date('2026-06-05T09:15:00Z').toISOString()
      },
      {
        id: 'd-05',
        name: 'Venture Capital CRM Deployment',
        value: 150000,
        stage: 'Qualified',
        probability: 50,
        leadId: 'l-05', // Michael Sterling - Sterling Capital
        assignedTo: exec2Id,
        expectedRevenue: 75000,
        createdAt: new Date('2026-06-06T15:30:00Z').toISOString(),
        updatedAt: new Date('2026-06-06T16:00:00Z').toISOString()
      },
      {
        id: 'd-06',
        name: 'Standard Subscription renewal Skyward',
        value: 48000,
        stage: 'Won',
        probability: 100,
        leadId: 'c-01', // Nate Robinson - Skyward (Customer)
        assignedTo: exec1Id,
        expectedRevenue: 48000,
        createdAt: new Date('2026-02-20T10:00:00Z').toISOString(),
        updatedAt: new Date('2026-03-12T10:00:00Z').toISOString()
      },
      {
        id: 'd-07',
        name: 'Premium Lab Consulting Contract',
        value: 24000,
        stage: 'Won',
        probability: 100,
        leadId: 'c-02', // Clara Oswald - Chronos Labs
        assignedTo: managerId,
        expectedRevenue: 24000,
        createdAt: new Date('2026-04-10T11:00:00Z').toISOString(),
        updatedAt: new Date('2026-05-02T11:00:00Z').toISOString()
      },
      {
        id: 'd-08',
        name: 'Dravus Logistics Pilot (Lost)',
        value: 65000,
        stage: 'Lost',
        probability: 0,
        leadId: 'l-06', // Karla Wagner - Dravus
        assignedTo: exec1Id,
        expectedRevenue: 0,
        createdAt: new Date('2026-05-02T10:00:00Z').toISOString(),
        updatedAt: new Date('2026-05-15T15:00:00Z').toISOString()
      }
    ];

    // Seed Activities
    this.activities = [
      {
        id: 'act-01',
        targetType: 'lead',
        targetId: 'l-01',
        type: 'Call',
        title: 'Introductory Discovery Call',
        description: 'Discussed cloud migration path. Client is using a legacy on-prem solution. Eager to see proposal.',
        date: new Date('2026-05-16T10:00:00Z').toISOString(),
        createdBy: exec1Id,
        createdByName: 'Elena Rostova'
      },
      {
        id: 'act-02',
        targetType: 'lead',
        targetId: 'l-01',
        type: 'Email',
        title: 'Sent Proposal & Architecture Slides',
        description: 'Sent detailed tier-2 proposal document via CRM email.',
        date: new Date('2026-06-03T11:00:00Z').toISOString(),
        createdBy: exec1Id,
        createdByName: 'Elena Rostova'
      },
      {
        id: 'act-03',
        targetType: 'lead',
        targetId: 'l-02',
        type: 'Call',
        title: 'Brief Phone Screening',
        description: 'Scheduled pilot requirements. Jessica has minor resistance with current timeline, needs follow-up.',
        date: new Date('2026-05-20T14:30:00Z').toISOString(),
        createdBy: exec2Id,
        createdByName: 'Jordan Chase',
        reminderDate: new Date('2026-06-10T09:00:00Z').toISOString(),
        reminderDone: false
      },
      {
        id: 'act-04',
        targetType: 'lead',
        targetId: 'l-04',
        type: 'Meeting',
        title: 'Interactive Web Demo with Stakeholders',
        description: 'Showed real-time visualization dashboard. Product fit was verified. Drafted contract parameters.',
        date: new Date('2026-05-28T15:00:00Z').toISOString(),
        createdBy: exec2Id,
        createdByName: 'Jordan Chase'
      },
      {
        id: 'act-05',
        targetType: 'customer',
        targetId: 'c-01',
        type: 'Note',
        title: 'Consultation Feedback Notes',
        description: 'Nate requested an extra onboarding session for their European sales desks next month.',
        date: new Date('2026-04-10T16:00:00Z').toISOString(),
        createdBy: adminId,
        createdByName: 'Sarah Jenkins',
        reminderDate: new Date('2026-06-12T10:00:00Z').toISOString(),
        reminderDone: false
      }
    ];

    // Seed Emails
    this.emails = [
      {
        id: 'em-01',
        sender: 'executive1@crm.com',
        to: 'r.chen@velocelogistics.com',
        subject: 'Acme Cloud Onboarding Infrastructure Specs',
        body: 'Hello Robert, following our discussions yesterday, I have attached our architecture checklist and security framework parameters. Looking forward to your review!\n\nBest,\nElena Rostova',
        sentAt: new Date('2026-05-16T11:15:00Z').toISOString(),
        sentBy: exec1Id
      },
      {
        id: 'em-02',
        sender: 'executive2@crm.com',
        to: 'alin@vertexmedia.com',
        subject: 'Acme CRM Integration Demo Invitation',
        body: 'Hi Amanda,\n\nWe have coordinated our schedules and reserved Thursday at 3 PM EST for a deeper live demo of our reporting models. We excited to share how they align with Vertex media workflows.\n\nWarm regards,\nJordan Chase',
        sentAt: new Date('2026-05-25T14:00:00Z').toISOString(),
        sentBy: exec2Id
      }
    ];

    // Seed Notifications
    this.notifications = [
      {
        id: 'nt-01',
        userId: exec1Id,
        title: 'New Lead Assignment',
        message: 'Lead "David Vance" from Core Solutions Co has been assigned to you.',
        type: 'Assignment',
        read: false,
        createdAt: new Date('2026-06-05T09:00:00Z').toISOString()
      },
      {
        id: 'nt-02',
        userId: exec2Id,
        title: 'Follow-up Reminder',
        message: 'You have a pending phone callback reminder for Jessica Fowler (Apex Health).',
        type: 'Reminder',
        read: false,
        createdAt: new Date('2026-06-07T06:00:00Z').toISOString()
      },
      {
        id: 'nt-03',
        userId: managerId,
        title: 'Deal Won Alert',
        message: 'Sales Rep Jordan Chase changed deal "Strategic CRM Integration" to WON ($120,000)!',
        type: 'StageChange',
        read: false,
        createdAt: new Date('2026-06-04T16:45:00Z').toISOString()
      }
    ];

    // Seed Reports (Placeholder snapshot logs)
    this.reports = [
      {
        id: 'rep-01',
        title: 'Q2 Core Sales and Pipeline Velocity',
        type: 'Sales',
        createdBy: managerId,
        criteria: { startDate: '2026-04-01', endDate: '2026-06-30' },
        generatedData: {
          totalDeals: 8,
          wonDeals: 2,
          wonValue: 72000,
          pipelineValue: 420000,
          expectedRevenue: 227250
        },
        createdAt: new Date('2026-06-01T17:00:00Z').toISOString()
      }
    ];

    this.saveAll();
  }
}

export const db = new DB();
