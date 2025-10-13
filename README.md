# HealthTrack Personal Wellness Platform - Frontend

This is the frontend application for the HealthTrack Personal Wellness Platform, built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui components.

## Project Overview

HealthTrack is a personal health and wellness management platform that allows users to:
- Track healthcare appointments
- Create and participate in wellness challenges
- Manage healthcare providers
- Generate health reports
- Manage family health records

## Features Implemented

- User authentication (login/register)
- Dashboard with health overview
- Appointment management (view, create)
- Wellness challenge management (view, create)
- User profile management
- Responsive design for all device sizes

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: React Context API (built-in with Next.js)

## Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── appointments/    # Appointment management pages
│   ├── challenges/      # Wellness challenge pages
│   ├── profile/         # User profile pages
│   ├── login/          # Authentication pages
│   ├── register/       # Registration pages
│   ├── dashboard/      # Main dashboard
│   └── page.tsx        # Home page
├── components/         # Reusable UI components
│   └── ui/             # shadcn/ui components
└── lib/                # Utility functions
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Available Pages

- `/` - Home page
- `/login` - User login
- `/register` - User registration
- `/dashboard` - Main dashboard
- `/appointments` - View all appointments
- `/appointments/new` - Create new appointment
- `/challenges` - View all challenges
- `/challenges/new` - Create new challenge
- `/profile` - User profile management

## Components

Custom components are located in `src/components/`:
- Navigation bar
- UI components (Button, Card, Input, etc.)

## Styling

This project uses Tailwind CSS for styling with shadcn/ui components. All styles are defined in `src/app/globals.css`.

## Next Steps

To complete the application, you would need to:

1. Connect to a backend API for data persistence
2. Implement actual authentication logic
3. Add form validation
4. Implement real-time updates for challenges
5. Add more detailed health reporting features
6. Implement family group management
7. Add healthcare provider verification workflow

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
