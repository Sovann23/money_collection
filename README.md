# Money Collection — Admin Dashboard

A React + Vite + Tailwind CSS admin dashboard for managing money contributions with Supabase backend.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Charts | Chart.js 4 + react-chartjs-2 |
| State | React Context API |
| Backend | Supabase (PostgreSQL + Auth) |
| Persistence | Supabase Database |

## Project Structure

```
money-collection/
├── index.html                   # HTML entry point
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── .env                        # Supabase config (create this)
└── src/
    ├── main.jsx                 # ReactDOM.createRoot
    ├── App.jsx                  # Root component + layout
    ├── index.css                # Tailwind directives + print styles
    ├── contexts/
    │   ├── AuthContext.jsx      # Supabase auth
    │   ├── ThemeContext.jsx     # dark / light theme
    │   ├── LanguageContext.jsx  # EN / KM translations
    │   └── ContributionsContext.jsx  # CRUD + Supabase
    ├── hooks/
    │   └── useToast.js          # Toast notifications
    ├── utils/
    │   └── translations.js      # EN + KM string maps
    └── components/
        ├── Auth.jsx             # Login/signup form
        ├── Header.jsx           # Sticky top bar + logout
        ├── Toast.jsx            # Toast + ToastContainer
        ├── Statistics.jsx       # 3 stat cards
        ├── Charts.jsx           # Bar + Doughnut charts
        ├── ContributionForm.jsx # Add / edit form
        └── ContributionsTable.jsx  # Table, search, CSV I/O
```

## Setup Instructions

### 1. Supabase Setup

1. Create a [Supabase](https://supabase.com) account
2. Create a new project
3. Go to Settings > API to get your project URL and anon key
4. Go to SQL Editor and run this schema:

```sql
-- Enable Row Level Security
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

-- Create contributions table
CREATE TABLE contributions (
  id BIGINT PRIMARY KEY DEFAULT EXTRACT(epoch FROM NOW())::BIGINT,
  participant_name TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('KHQR', 'Cash')),
  currency TEXT NOT NULL CHECK (currency IN ('Riel', 'Dollar')),
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  remark TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create policy for users to only access their own data
CREATE POLICY "Users can only access their own contributions" ON contributions
  FOR ALL USING (auth.uid() = user_id);
```

### 2. Environment Variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install and Run

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Production build → dist/
npm run build

# Preview production build
npm run preview
```

## Features

- **User Authentication** — Sign up / sign in with email/password
- **Data Isolation** — Each user sees only their own contributions
- **Automatic Migration** — Local data migrates to Supabase on first login
- **Dark / Light mode** — persisted in localStorage
- **Bilingual UI** — English 🇬🇧 and Khmer 🇰🇭 (toggles font family too)
- **CRUD contributions** — add, edit, delete with validation
- **Charts** — payment method bar chart + currency doughnut chart
- **CSV export / import**
- **Print / PDF** — `window.print()` with `no-print` utility class hiding UI chrome
- **Responsive** — single-column on mobile, 2-column grid on desktop
