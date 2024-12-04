# Restaurant Management System

A full-stack application for managing Clients, Orders, and Restaurants built with Remix and TypeScript.

## 🚀 Live Demo

- [Application](https://kiwitest.vercel.app/)
- [GitHub Repository](https://github.com/VirJuarez/kiwitest)

## 🛠️ Tech Stack

- **Framework:** Remix
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Database:** PostgreSQL (hosted on GCP)
- **ORM:** Prisma
- **Testing:** Jest
- **Build Tool:** Vite

## ✨ Features

- **Home Page** with three main sections (Clients, Orders, Restaurants)
- **CRUD Operations** for all entities
- **Filters & Sorting:**
  - Alphabetical sorting for Clients and Restaurants
  - Client/Restaurant filtering for Orders
- **User-friendly modals** for data management
- **Responsive empty states** with clear call-to-action buttons

## 🏗️ Local Setup

### Prerequisites

- Node.js v20+
- PostgreSQL

### Installation

```bash
# Clone repository
git clone https://github.com/VirJuarez/kiwitest.git
cd kiwitest

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🐳 Docker Setup

```bash
# Build image
docker build -t application-name .

# Run container
docker run -p 3000:3000 application-name
```

Visit `http://localhost:3000` to access the application.

## 🧪 Testing

```bash
npm test
```

Tests run automatically via GitHub Actions on push/PR to `master` or `dev` branches.
