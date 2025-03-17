# Stripe Coach - Subscription Monitoring Dashboard

A modern, real-time subscription monitoring dashboard for health coaches to track their clients' subscriptions, payment statuses, and revenue trends.

## Features

- 🔐 Secure Authentication
  - Google Sign-In
  - Email/Password Authentication
  - Role-based access control

- 📊 Subscription Monitoring
  - Real-time subscription status tracking
  - Payment status monitoring
  - Revenue analytics and trends
  - Client retention metrics

- 🔍 Advanced Filtering & Search
  - Sort by multiple criteria
  - Filter by subscription status
  - Search clients and plans
  - Export capabilities

- 📈 Visual Analytics
  - Revenue trend graphs
  - Subscription status distribution
  - Payment success rates
  - Client retention charts

## Tech Stack

- **Frontend**
  - Next.js (React)
  - Tailwind CSS
  - Recharts
  - Firebase Auth

- **Backend**
  - Node.js/Express.js
  - Firebase Functions
  - Prisma ORM
  - PostgreSQL

- **APIs & Services**
  - Stripe API (Read-Only)
  - Firebase Authentication
  - SendGrid (Email Notifications)

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/stripe-coach.git
cd stripe-coach
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```
Fill in your environment variables in `.env.local`

4. Set up the database
```bash
npx prisma migrate dev
```

5. Run the development server
```bash
npm run dev
```

## Environment Variables

Required environment variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Stripe Configuration
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# SendGrid Configuration
SENDGRID_API_KEY=

# Database Configuration
DATABASE_URL=

# Next Auth Configuration
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

## Project Structure

```
stripe-coach/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── lib/             # Utility functions and configurations
│   └── types/           # TypeScript type definitions
├── prisma/              # Database schema and migrations
├── public/             # Static assets
└── package.json        # Project dependencies and scripts
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
