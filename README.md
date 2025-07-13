# Simple Invoice

A clean, straightforward invoice management app built with Next.js. No complicated setup, no monthly fees, just a simple way to create and manage invoices locally.

## What it does

Simple Invoice helps you create professional invoices quickly. You can manage customers, company profiles, and generate PDF invoices with drag and drop line items. Everything runs locally on your machine with a SQLite database.

## Key features

- **Create invoices fast** with an intuitive form interface
- **Manage customers and companies** with auto-complete and real-time saving
- **Dashboard overview** showing open, overdue, and paid invoice totals
- **Search and filter** invoices easily
- **PDF generation** for sending to clients
- **Drag and drop** line items to reorder them
- **Status tracking** (draft, pending, paid, overdue)
- **Duplicate invoices** to save time on similar work

## Quick start for users

For the easiest installation, download the pre-built binaries from the [Releases](https://github.com/ottendorfcipher/invoice-app/releases) section below.

## Development setup

To run the app in development mode:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up the database:
   ```bash
   npx drizzle-kit push
   ```

3. Start the web development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:3000`

### Running as Electron app (development)

To run the desktop app in development:

```bash
npm run electron:dev
```

This will start the Next.js dev server and launch the Electron app automatically.

## Tech stack

- **Next.js 15** for the web framework
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Drizzle ORM** with SQLite for data storage
- **Shadcn/ui** for UI components
- **React PDF** for invoice generation

## Local first

Everything runs on your computer. Your data stays private and you're not dependent on any external services or internet connection to manage your invoices.
