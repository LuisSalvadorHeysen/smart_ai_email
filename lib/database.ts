import { JSONFilePreset } from 'lowdb/node';

// Define the structure of our database
interface DbSchema {
  emails: {
    id: string;
    subject: string;
    from: string;
    date: string;
    snippet: string;
    textBody?: string;
    htmlBody?: string;
    isInternship?: boolean;
    processed: boolean;
    lastUpdated: string;
    aiResults?: {
      category: string;
      sentiment: string;
      confidence: string;
    };
  }[];
  internships: {
    id: string;
    emailId: string;
    company: string;
    position: string;
    status: string;
    date: string;
    notes: string;
  }[];
  systemState: {
    lastFetchTime: string | null;
  };
}

// Set up the database with default values
const defaultData: DbSchema = { 
  emails: [], 
  internships: [],
  systemState: { lastFetchTime: null } 
};

// Initialize the database connection
const db = await JSONFilePreset<DbSchema>('data/db.json', defaultData);

export const dbManager = {
  // Get all emails with their AI results
  getAllEmailsWithAIResults: async () => {
    await db.read();
    return db.data.emails;
  },

  // Get a single email by its ID, including AI results
  getEmailWithAIResults: async (id: string) => {
    await db.read();
    return db.data.emails.find(e => e.id === id);
  },

  // Save a basic snapshot of an email
  saveEmailSnapshot: async (email: Omit<DbSchema['emails'][0], 'snippet' | 'processed' | 'lastUpdated'> & { lastUpdated: string }) => {
    await db.read();
    const existing = db.data.emails.find(e => e.id === email.id);
    if (!existing) {
      db.data.emails.push({
        ...email,
        snippet: email.subject.substring(0, 100),
        processed: false,
        lastUpdated: new Date().toISOString()
      });
      await db.write();
    }
  },

  // Save AI processing results for an email
  saveAIResults: async (id: string, results: DbSchema['emails'][0]['aiResults']) => {
    await db.read();
    const email = db.data.emails.find(e => e.id === id);
    if (email) {
      email.aiResults = results;
      email.processed = true;
      email.isInternship = results?.category === 'internship';
      email.lastUpdated = new Date().toISOString();
      await db.write();
    }
  },

  // Get and update the last fetch time
  getSystemState: async () => {
    await db.read();
    return db.data.systemState;
  },

  updateLastFetchTime: async () => {
    await db.read();
    db.data.systemState.lastFetchTime = new Date().toISOString();
    await db.write();
  },

  // Internship-specific methods
  getAllInternships: async () => {
    await db.read();
    return db.data.internships;
  },

  saveInternship: async (internship: DbSchema['internships'][0]) => {
    await db.read();
    const existingIndex = db.data.internships.findIndex(i => i.id === internship.id);
    if (existingIndex > -1) {
      db.data.internships[existingIndex] = internship;
    } else {
      db.data.internships.push(internship);
    }
    await db.write();
  },

  clearInternships: async () => {
    await db.read();
    db.data.internships = [];
    await db.write();
  }
}; 