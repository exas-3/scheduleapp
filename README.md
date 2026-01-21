# ShiftFlow

A web-based staff scheduling and workforce management application designed for businesses to manage employee shifts, track labor costs, and ensure compliance with Greek labor laws.

## Features

### Schedule Management
- Weekly schedule grid view with drag-and-drop functionality
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
- Weekly and monthly cost breakdowns
- Per-employee cost analysis

### Labor Law Compliance
- Automatic alerts for:
  - Weekly hours exceeding employee limits
  - EU directive 48-hour weekly limit violations
  - Insufficient rest periods (minimum 11 hours between shifts)
  - Shifts longer than 10 hours
  - Sunday work (75% wage increase requirement)

### ERGANI Export
- CSV export for Greek labor authority (ERGANI) compliance

## Tech Stack

- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **Storage:** Browser LocalStorage
- **UI:** Custom dark theme with CSS variables

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/exas-3/scheduleapp.git
   ```

2. Open `index.html` in your browser

No build process or dependencies required.

## Usage

The application comes preloaded with demo data including 6 sample employees and shifts. Navigate using the sidebar:

- **Πρόγραμμα** (Schedule) - View and manage weekly shifts
- **Προσωπικό** (Staff) - Manage employees
- **Κόστος** (Cost) - View labor cost analysis
- **Ειδοποιήσεις** (Alerts) - Check compliance warnings

## Notes

- UI language: Greek
- Data persists in browser LocalStorage
- No backend required - runs entirely client-side

## License

MIT
