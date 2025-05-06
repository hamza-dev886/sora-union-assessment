# sora-union-assessment

## Prerequisites

- Node.js (v16 or higher)
- Postgres
- npm/yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/hamza-dev886/sora-union-assessment.git
cd sora-union-assessment
```

## Backend

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
# Database Configuration
DATABASE_URL="postgresql://user:password@host:port/db_name?schema=public"

# JWT Configuration
JWT_SECRET=your_access_secret_key
```

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Run database migrations:
```bash
npm run prisma:migrate
```

## Running the Backend

### Development mode
```bash
npm run dev
```

## Frontend

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory with the following variables:
```
# API URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# JWT Configuration
AUTH_SECRET=your_access_secret_key
```

## Running the Frontend

### Development mode
```bash
npm run dev
```
