# Simple Invoice

A clean, straightforward invoice management application built with Next.js and Electron. No complicated setup, no monthly fees, just a simple way to create and manage invoices locally on your machine.

## What it does

Simple Invoice helps you create professional invoices quickly and efficiently. You can manage customers, company profiles, and generate PDF invoices with an intuitive interface. Everything runs locally on your machine with a SQLite database, ensuring your data stays private and secure.

## Key features

### Invoice Management
- **Create invoices fast** with an intuitive form interface and drag-and-drop line items
- **Multiple invoice statuses** (draft, open, paid, overdue, canceled)
- **Customizable invoice templates** with company branding
- **Rich text editor** for notes and additional information
- **Auto-generated invoice numbers** with customizable prefixes
- **Duplicate invoices** to save time on similar work
- **PDF generation** for sending to clients

### Customer & Company Management
- **Customer database** with contact information and history
- **Company profiles** with logo support and default settings
- **Auto-complete** for quick data entry
- **Real-time saving** of all changes

### Dashboard & Analytics
- **Overview dashboard** showing open, overdue, and paid invoice totals
- **Advanced search and filtering** by status, date range, and customer
- **Date range picker** for filtering invoices by time period
- **Status badges** for quick visual identification

### Data Management
- **SQLite database** for reliable local storage
- **JSON export/import** for data backup and migration
- **Drizzle ORM** for type-safe database operations

## Quick start for users

For the easiest installation, download the pre-built binaries from the [Releases](https://github.com/ottendorfcipher/simple-invoice/releases) section.

### Available platforms:
- **macOS** (Intel & Apple Silicon)
- **Windows** (x64)
- **Linux** (x64, .deb and .tar.gz)

## Development setup

To run the app in development mode:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the database:**
   ```bash
   npx drizzle-kit push
   ```

3. **Start the web development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser to `http://localhost:3000`**

### Running as Electron app (development)

To run the desktop app in development:

```bash
npm run electron:dev
```

This will start the Next.js dev server and launch the Electron app automatically.

### Building for production

**Build the Next.js app:**
```bash
npm run build
```

**Build Electron distributables:**
```bash
# All platforms
npm run dist:all

# Specific platforms
npm run dist:mac
npm run dist:win
npm run dist:linux
```

## Database management

The app uses Drizzle ORM with SQLite for data storage. Available database commands:

```bash
# Push schema changes to database
npm run db:push

# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Open Drizzle Studio (database browser)
npm run db:studio
```

## Project structure

```
simple-invoice/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/               # API routes
│   │   ├── customers/         # Customer management pages
│   │   ├── company-profiles/  # Company profile pages
│   │   └── invoices/          # Invoice management pages
│   ├── components/            # React components
│   │   └── ui/               # Shadcn/ui components
│   └── db/                   # Database configuration
│       ├── schema.ts         # Database schema
│       ├── sql-js-adapter.ts # SQLite adapter
│       └── json-adapter.ts   # JSON file adapter
├── electron/                 # Electron main process
├── drizzle/                  # Database migrations
├── public/                   # Static assets
└── dist/                     # Built applications
```

## Tech stack

### Core Framework
- **Next.js 15** - Full-stack React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Electron 37** - Desktop app framework
- **React 19** - UI library with latest features

### Database & ORM
- **SQLite** - Local database for data persistence
- **Drizzle ORM** - Type-safe database operations
- **SQL.js** - SQLite in the browser/Electron

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful, accessible React components
- **Lucide React** - Beautiful icons
- **Radix UI** - Primitive components for accessibility

### Forms & Data Management
- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation
- **TanStack Query** - Data fetching and caching
- **TanStack Table** - Powerful table component

### PDF & Rich Text
- **React PDF** - PDF generation for invoices
- **Tiptap** - Rich text editor for notes
- **QR Code** - QR code generation for invoices

### Development Tools
- **Drizzle Kit** - Database migrations and management
- **Electron Builder** - Package and build Electron apps
- **Concurrently** - Run multiple commands concurrently

## Local first approach

Simple Invoice is designed with a local-first philosophy:

- **Privacy**: Your data never leaves your machine
- **No subscriptions**: No monthly fees or external dependencies
- **Offline capable**: Works without internet connection
- **Data ownership**: You own and control your invoice data
- **Backup friendly**: Easy to backup with simple file copying

## Dual deployment modes

### Desktop Application (Electron)
- Native desktop experience
- System integration
- Offline-first operation
- Auto-updates capability

### Web Application (Next.js)
- Browser-based access
- Responsive design
- Easy deployment
- Cross-platform compatibility
