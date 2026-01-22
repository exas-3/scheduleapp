# ShiftFlow

Staff scheduling and workforce management application for hospitality businesses. Built with Next.js and designed for Greek labor law compliance.

## Features

### Schedule Management
- Weekly schedule grid with drag-and-drop functionality
- Add, edit, and delete shifts via modal dialogs
- Support for multiple roles: Waiter, Barista, Kitchen, Cashier, Manager
- Week navigation with quick access to current week

### Employee Management
- Employee profiles with contact info and contract details
- Contract types: Full-time, Part-time, Seasonal
- Configurable hourly rates and max weekly hours
- Per-day availability settings

### Cost Analysis
- Real-time labor cost calculations
- Overtime tracking (1.5x multiplier)
- Weekly cost breakdowns
- Per-employee cost analysis

### Labor Law Compliance
Automatic alerts for Greek/EU regulations:
- Weekly hours exceeding employee limits
- EU directive 48-hour weekly limit violations
- Insufficient rest periods (minimum 11 hours between shifts)
- Shifts longer than 10 hours
- Sunday work (75% wage increase requirement)

### ERGANI Export
- CSV export for Greek labor authority (ERGANI) compliance

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + Tailwind CSS
- **Data**: JSON file storage
- **Language**: Greek (Ελληνικά)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── employees/    # Employee CRUD
│   │   └── shifts/       # Shift CRUD
│   ├── layout.jsx        # Root layout
│   ├── page.jsx          # Main page
│   └── globals.css       # Global styles
├── components/
│   ├── schedule/         # Schedule grid components
│   ├── employees/        # Employee management
│   ├── costs/            # Cost analysis view
│   ├── alerts/           # Compliance alerts
│   └── ui/               # Reusable UI components
├── lib/
│   ├── db.js             # Data storage layer
│   └── helpers.js        # Utility functions
└── data/                 # JSON data files (auto-generated)
```

## Usage

The application comes preloaded with demo data including 6 sample employees and shifts. Navigate using the sidebar:

- **Πρόγραμμα** (Schedule) - View and manage weekly shifts
- **Προσωπικό** (Staff) - Manage employees
- **Κόστος** (Cost) - View labor cost analysis
- **Ειδοποιήσεις** (Alerts) - Check compliance warnings

## License

MIT
