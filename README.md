# Money Collection — Admin Dashboard

A React + Vite + Tailwind CSS rewrite of the Money Collection admin dashboard.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Charts | Chart.js 4 + react-chartjs-2 |
| State | React Context API |
| Persistence | localStorage |

## Project Structure

```
money-collection/
├── index.html                   # HTML entry point
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── src/
    ├── main.jsx                 # ReactDOM.createRoot
    ├── App.jsx                  # Root component + layout
    ├── index.css                # Tailwind directives + print styles
    ├── contexts/
    │   ├── ThemeContext.jsx      # dark / light theme
    │   ├── LanguageContext.jsx   # EN / KM translations
    │   └── ContributionsContext.jsx  # CRUD + localStorage
    ├── hooks/
    │   └── useToast.js          # Toast notifications
    ├── utils/
    │   └── translations.js      # EN + KM string maps
    └── components/
        ├── Header.jsx           # Sticky top bar
        ├── Toast.jsx            # Toast + ToastContainer
        ├── Statistics.jsx       # 3 stat cards
        ├── Charts.jsx           # Bar + Doughnut charts
        ├── ContributionForm.jsx # Add / edit form
        └── ContributionsTable.jsx  # Table, search, CSV I/O
```

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server  (http://localhost:5173)
npm run dev

# Production build → dist/
npm run build

# Preview production build
npm run preview
```

## Features

- **Dark / Light mode** — persisted in localStorage
- **Bilingual UI** — English 🇬🇧 and Khmer 🇰🇭 (toggles font family too)
- **CRUD contributions** — add, edit, delete with validation
- **Charts** — payment method bar chart + currency doughnut chart
- **CSV export / import**
- **Print / PDF** — `window.print()` with `no-print` utility class hiding UI chrome
- **Responsive** — single-column on mobile, 2-column grid on desktop
