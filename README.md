# Smart AI Email Assistant

A modern, AI-powered email management application that helps users organize, analyze, and respond to emails efficiently. Built with Next.js, Google Gemini AI, and Gmail API integration.

## 🚀 Live Demo

[Deploy to Vercel](https://vercel.com) - *Coming Soon*

## ✨ Features

### 📧 Smart Email Management
- **Gmail Integration**: Seamless connection with Gmail API for real-time email access
- **AI-Powered Classification**: Automatically categorizes emails using Google Gemini AI
- **Sentiment Analysis**: Analyzes email tone and sentiment for better understanding
- **Smart Processing**: Only processes new emails to optimize performance

### 🤖 AI Assistant
- **Tone Adjustment**: Rewrite emails in different tones (formal, friendly, concise, assertive)
- **Action Item Extraction**: Automatically identifies and extracts action items from emails
- **AI Reply Generation**: Generates contextual reply suggestions
- **Internship Detection**: Automatically detects and extracts internship opportunities

### 💼 Internship Tracker
- **Smart Detection**: AI-powered internship opportunity identification
- **Application Management**: Track internship applications with status updates
- **Email Linking**: Direct links back to source emails in Gmail
- **Status Filtering**: Filter applications by status (Received, Interviewing, Offer, Rejected)

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Resizable Panels**: Adjustable email content and AI assistant panels
- **Dark/Light Theme**: Built-in theme switching
- **Google Material Design**: Clean, modern interface following Google's design principles

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Mantine UI** - Modern component library
- **Tailwind CSS** - Utility-first CSS framework

### Backend & APIs
- **Next.js API Routes** - Serverless backend functions
- **Google Gmail API** - Email integration
- **Google Gemini AI** - Advanced AI processing
- **NextAuth.js** - Authentication with Google OAuth

### Data & Storage
- **LowDB** - Lightweight JSON database
- **Local Storage** - Client-side data persistence
- **File-based Storage** - Simple, reliable data storage

### Development Tools
- **ESLint** - Code linting
- **Turbopack** - Fast development bundler
- **TypeScript** - Static type checking

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Google Cloud Console account
- Gmail API credentials
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smart-ai-email.git
   cd smart-ai-email
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

1. **Sign in with Google** to connect your Gmail account
2. **Browse your inbox** with AI-powered categorization
3. **Use the AI Assistant** to analyze and respond to emails
4. **Track internship opportunities** automatically detected by AI
5. **Manage applications** in the dedicated internship tracker

## 🔧 API Endpoints

- `GET /api/gmail` - Fetch emails from Gmail
- `POST /api/classify` - AI email classification
- `POST /api/ai/[feature]` - AI processing features
- `GET/POST /api/internships` - Internship management
- `GET /api/auth/[...nextauth]` - Authentication

## 🎯 Key Features for Portfolio

### Technical Highlights
- **Full-stack development** with modern React/Next.js
- **AI integration** with Google's latest Gemini model
- **OAuth authentication** with Google
- **Real-time data processing** and caching
- **Responsive design** with modern UI components
- **TypeScript** for type safety and better development experience

### Problem Solving
- **Email overload management** through AI-powered organization
- **Internship application tracking** for students and job seekers
- **Automated email analysis** to save time and improve productivity
- **Smart categorization** to prioritize important emails

## 📊 Performance Optimizations

- **Lazy loading** of email content
- **Database caching** to avoid repeated API calls
- **Incremental processing** of new emails only
- **Optimized AI prompts** for faster responses
- **Efficient state management** with React hooks

## 🔒 Security Features

- **OAuth 2.0 authentication** with Google
- **Secure API key management** through environment variables
- **Input validation** and sanitization
- **CORS protection** and rate limiting

## 🚀 Deployment

This project is optimized for deployment on Vercel:

1. **Push to GitHub** repository
2. **Connect to Vercel** and import the repository
3. **Configure environment variables** in Vercel dashboard
4. **Deploy automatically** on every push

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name** - [LinkedIn](https://linkedin.com/in/yourprofile) - [GitHub](https://github.com/yourusername)

---

*Built with ❤️ for better email management and productivity*
