// In-memory database for demo/testing (not persistent)

type Email = {
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
};

type Internship = {
  id: string;
  emailId: string;
  company: string;
  position: string;
  status: string;
  date: string;
  notes: string;
};

type SystemState = {
  lastFetchTime: string | null;
};

const db = {
  emails: [] as Email[],
  internships: [] as Internship[],
  systemState: { lastFetchTime: null } as SystemState,
};

export const dbManager = {
  getAllEmailsWithAIResults: async () => db.emails,
  getEmailWithAIResults: async (id: string) => db.emails.find(e => e.id === id),
  saveEmailSnapshot: async (email: Omit<Email, 'snippet' | 'processed' | 'lastUpdated'> & { lastUpdated: string }) => {
    if (!db.emails.find(e => e.id === email.id)) {
      db.emails.push({
        ...email,
        snippet: email.subject.substring(0, 100),
        processed: false,
        lastUpdated: new Date().toISOString(),
      });
    }
  },
  saveAIResults: async (id: string, results: Email['aiResults']) => {
    const email = db.emails.find(e => e.id === id);
    if (email) {
      email.aiResults = results;
      email.processed = true;
      email.isInternship = results?.category === 'internship';
      email.lastUpdated = new Date().toISOString();
    }
  },
  getSystemState: async () => db.systemState,
  updateLastFetchTime: async () => {
    db.systemState.lastFetchTime = new Date().toISOString();
  },
  getAllInternships: async () => db.internships,
  saveInternship: async (internship: Internship) => {
    const existingIndex = db.internships.findIndex(i => i.id === internship.id);
    if (existingIndex > -1) {
      db.internships[existingIndex] = internship;
    } else {
      db.internships.push(internship);
    }
  },
  clearInternships: async () => {
    db.internships = [];
  },
}; 