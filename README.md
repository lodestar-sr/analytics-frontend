
# Business Analytics Dashboard (Frontend)

## Overview

Business Analytics Dashboard is a React-based frontend application using Vite, TypeScript, MUI (Material-UI), and Tailwind CSS, designed to interact with a Node.js backend for AI-powered business analytics. It leverages WebSocket for real-time updates, allowing users to submit business questions and view results including SQL queries, data tables, charts, and streamed textual analysis.

## Setup Instructions

Clone the repository:
```
git clone https://github.com/lodestar-sr/analytics-frontend
```

### Setup Frontend

Install frontend dependencies:
```
cd fe
npm install
cp .env.example .env
```

copy this content in `.env` file
```
VITE_API_BASE_URL=http://localhost:3001
```
Start the Frontend:
```
npm run dev
```
The app will be available at http://localhost:5173.

### Setup Backend

Install backend dependencies:
```
cd be
npm install
```
Start the backend server:
```
node main.js
```
Ensure the provided backend server is running on http://localhost:3001.

## Technologies

- Framework: React with Vite and TypeScript for type safety.
- UI Library: MUI for polished, accessible components.
- Styling: Tailwind CSS for additional layout tweaks.
- State Management: React hooks (useState, useEffect).

## Main Components

- InquiryForm: Handles question input and submission.
- ResultsDisplay: Shows inquiry results (SQL, table, chart, text).
- ChartRenderer: Renders Recharts charts.
- TableRenderer: Displays data tables.
- EventLog: Logs backend communication.

## Dependencies

- API Calls: axios
- WebSocket: socket.io-client for inquiry_updated events.
- Charts: Recharts for bar, line, multiBar, multiLine, and pie charts.
- SQL Display: react-syntax-highlighter for formatted SQL.
- Responsive Design: Grid system for desktop and mobile compatibility.
- UI Library: chakra-ui for UI components and theming.

## Usage

Open http://localhost:3000.

Submit questions like:

- "What are the sales trends?"
- "Who are our top customers?"
- "What is the product performance?"

## Notes

Ensure the backend runs at http://localhost:3001.