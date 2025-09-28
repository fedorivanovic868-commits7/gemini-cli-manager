# Gemini CLI Manager

A modern web application built with Next.js for managing `gemini-cli` sessions and tracking book translation progress. This application is designed for deployment on Vercel and provides an intuitive interface for managing your translation projects.

## ✨ Features

### 🔐 Authentication
- Simple login system with a single password
- Secure sessions using HTTP-only cookies
- Middleware protection for all routes

### 🖥️ Session Management
- **CRUD Operations**: Create, read, update, and delete sessions
- **Status Management**: `Free`, `In Use`, `Quota Expired`
- **Import/Export**: Upload and download sessions in ZIP format
- **Auto Reset**: Daily reset of "Quota Expired" status at 7:00 Moscow time

### 📚 Translation Management
- **Progress Tracking**: Monitor translated and total chapters
- **File Analysis**: Automatic character, word, and reading time calculation for .txt files
- **Status Management**: `Needs Translation`, `In Translation`, `Translated`
- **Progress Visualization**: Graphical completion indicators

### 🎨 Modern UI/UX
- **Dark theme** by default
- **Responsive design** for mobile devices
- **shadcn/ui components** for consistent interface
- **Toast notifications** for user feedback

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Vercel Postgres
- **Deployment**: Vercel

## 🚀 Setup and Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Vercel account with Postgres configured

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd perevod-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file and fill in the following variables:
   ```env
   # Database configuration (get from Vercel Postgres)
   POSTGRES_URL=
   POSTGRES_PRISMA_URL=
   POSTGRES_URL_NO_SSL=
   POSTGRES_URL_NON_POOLING=
   POSTGRES_USER=
   POSTGRES_HOST=
   POSTGRES_PASSWORD=
   POSTGRES_DATABASE=
   
   # Application authentication
   APP_PASSWORD=your_secure_password_here
   
   # NextAuth configuration
   NEXTAUTH_SECRET=your_nextauth_secret_here
   NEXTAUTH_URL=http://localhost:3000
   
   # Cron job security
   CRON_SECRET=your_cron_secret_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

### Deploy to Vercel

1. **Connect to Vercel**
   - Import the project to Vercel
   - Connect Vercel Postgres
   
2. **Configure environment variables**
   Add all variables from `.env.local` to your Vercel project settings

3. **Cron Job Setup**
   The `vercel.json` file is already configured for automatic session reset.
   The cron job will run daily at 4:00 UTC (7:00 MSK).

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication
│   │   ├── sessions/      # Session management
│   │   ├── translations/  # Translation management
│   │   └── cron/          # Cron jobs
│   ├── login/             # Login page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard-layout.tsx
│   ├── sessions-tab.tsx
│   └── translations-tab.tsx
├── lib/                   # Utilities
│   ├── db.ts             # Database operations
│   ├── auth.ts           # Authentication utilities
│   ├── file-analyzer.ts  # File analysis
│   └── utils.ts          # Common utilities
└── middleware.ts         # Next.js middleware
```

## 🗄️ Database Schema

### Sessions Table
```sql
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  variable TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Свободно',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Translation Titles Table
```sql
CREATE TABLE translation_titles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Нужен перевод',
  total_chapters INTEGER NOT NULL DEFAULT 0,
  translated_chapters INTEGER NOT NULL DEFAULT 0,
  file_name TEXT,
  file_char_count INTEGER,
  file_word_count INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Usage

### Session Management
1. **Login** with your configured password
2. **Add sessions** with name and variable
3. **Manage status** (Free/In Use/Quota Expired)
4. **Export sessions** as ZIP files
5. **Import sessions** from ZIP files

### Translation Tracking
1. **Create translation projects** with chapter counts
2. **Upload .txt files** for automatic analysis
3. **Track progress** with visual indicators
4. **Update status** as translation progresses

## 🔒 Security Features

- Password-protected access
- HTTP-only cookies for session management
- CSRF protection via Next.js middleware
- Secure environment variable handling
- Cron job authentication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🐛 Known Issues & Roadmap

- [ ] Add bulk session operations
- [ ] Implement data export/import for translations
- [ ] Add more file format support
- [ ] Implement user roles and permissions
- [ ] Add statistics and analytics dashboard

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.
