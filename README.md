# BloodReq Admin

<p align="center">
  <img src="public/blood-drop.svg" alt="BloodReq Admin" width="80"/>
</p>

<p align="center">
  <strong>Blood Donation Management Admin Dashboard & API Backend</strong>
</p>

---

## 🖥 Overview

BloodReq Admin is a comprehensive Next.js 16 application serving as both the **Admin Dashboard** for managing the BloodReq platform and the **API Backend** for the mobile application. Built with modern React 19, MongoDB, Firebase Admin SDK, and Tailwind CSS 4.

### Key Features

- 📊 **Admin Dashboard** - Complete administrative control panel
- 🔐 **Role-Based Access Control (RBAC)** - Admin and moderator roles
- 👥 **User Management** - View, edit, and manage all registered users
- 🩸 **Blood Request Management** - Approve, reject, and monitor blood requests
- 💰 **Fundraiser Management** - Oversee medical fundraising campaigns
- 📧 **Email Communications** - Send bulk emails and manage templates
- 📍 **Location Management** - Manage countries, cities, and areas
- 🔔 **Push Notifications** - Send notifications via OneSignal
- 📈 **Analytics & Reports** - Track platform statistics
- 💳 **Payment Settings** - Configure payment gateways
- 🌍 **Multi-Language** - Internationalization with next-intl
- 🌓 **Dark/Light Theme** - Full theme support

---

## 🛠 Tech Stack

| Category           | Technology              |
| ------------------ | ----------------------- |
| **Framework**      | Next.js 16 (App Router) |
| **Runtime**        | React 19                |
| **Language**       | TypeScript 5            |
| **Database**       | MongoDB 7.0             |
| **Authentication** | Firebase Admin SDK      |
| **Styling**        | Tailwind CSS 4          |
| **UI Components**  | Radix UI + shadcn/ui    |
| **Forms**          | React Hook Form + Zod   |
| **Email**          | Nodemailer              |
| **Notifications**  | OneSignal REST API      |
| **Animation**      | Framer Motion + GSAP    |
| **Maps**           | Google Maps API         |
| **i18n**           | next-intl               |

---

## 📁 Project Structure

```
bloodreq-admin/
├── .env                        # Environment variables (secrets)
├── .env.template               # Environment template
├── messages/                   # i18n translation files
│   ├── en.json                 # English translations
│   ├── hi.json                 # Hindi translations
│   ├── bn.json                 # Bengali translations
│   ├── or.json                 # Odia translations
│   └── mr.json                 # Marathi translations
├── public/                     # Static assets
│   ├── blood-drop.svg          # Logo
│   └── landing-images/         # Landing page images
├── scripts/                    # Utility scripts
│   ├── seed-countries.ts       # Seed countries data
│   ├── seed-locations.ts       # Seed locations data
│   └── ...                     # Other seeding scripts
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth pages (route group)
│   │   │   ├── login/          # Login page
│   │   │   └── register/       # Register page
│   │   ├── admin/              # Admin dashboard pages
│   │   │   ├── layout.tsx      # Admin layout with sidebar
│   │   │   ├── dashboard/      # Dashboard overview
│   │   │   ├── users/          # User management
│   │   │   ├── blood-requests/ # Blood request management
│   │   │   ├── donations/      # Donation records
│   │   │   ├── fundraisers/    # Fundraiser management
│   │   │   ├── moderators/     # Moderator management
│   │   │   ├── notifications/  # Push notification center
│   │   │   ├── locations/      # Location management
│   │   │   ├── email/          # Email management
│   │   │   ├── ads/            # Ad configuration
│   │   │   ├── reports/        # Analytics & reports
│   │   │   ├── payment-settings/ # Payment gateway config
│   │   │   ├── settings/       # App settings
│   │   │   └── profile/        # Admin profile
│   │   ├── api/                # API Routes (Backend)
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── blood-requests/ # Blood request CRUD
│   │   │   ├── blood-donations/# Donation management
│   │   │   ├── fundraisers/    # Fundraiser CRUD
│   │   │   ├── donations/      # Financial donations
│   │   │   ├── profile/        # User profile endpoints
│   │   │   ├── notifications/  # Push notification endpoints
│   │   │   ├── locations/      # Location data endpoints
│   │   │   ├── leaderboard/    # Leaderboard data
│   │   │   ├── campaigns/      # Marketing campaigns
│   │   │   ├── payments/       # Payment processing
│   │   │   ├── upload/         # File upload
│   │   │   ├── config/         # App configuration
│   │   │   └── ads/            # Ad configuration
│   │   ├── auth/               # Auth callback handlers
│   │   ├── update-password/    # Password update page
│   │   ├── globals.css         # Global styles
│   │   ├── landing.css         # Landing page styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── components/             # React components
│   │   ├── auth/               # Auth-specific components
│   │   ├── layout/             # Layout components (sidebar, header)
│   │   ├── reactbits/          # Custom animated components
│   │   ├── theme-provider.tsx  # Theme context provider
│   │   └── ui/                 # shadcn/ui components
│   ├── contexts/               # React contexts
│   │   └── auth-context.tsx    # Auth state context
│   ├── i18n/                   # i18n configuration
│   │   └── request.ts          # Locale request handling
│   └── lib/                    # Utility libraries
│       ├── api-utils.ts        # API helper functions
│       ├── auth/               # Firebase auth helpers
│       │   ├── admin.ts        # Firebase Admin SDK init
│       │   ├── auth.helpers.ts # Auth utility functions
│       │   └── session.ts      # Session management
│       ├── db/                 # Database utilities
│       │   └── mongodb.ts      # MongoDB connection
│       ├── email/              # Email utilities
│       │   └── smtp.ts         # SMTP/Nodemailer config
│       ├── onesignal.ts        # OneSignal API wrapper
│       ├── rbac.ts             # Role-based access control
│       └── utils.ts            # General utilities
├── i18n.ts                     # i18n configuration
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

---

## 📂 File Details

### API Routes (`src/app/api/`)

| Route                                    | Methods          | Description                  |
| ---------------------------------------- | ---------------- | ---------------------------- |
| `/api/auth/signup`                       | POST             | User registration            |
| `/api/auth/signin`                       | POST             | Email/password login         |
| `/api/auth/oauth`                        | POST             | Google OAuth login           |
| `/api/auth/verify-otp`                   | POST             | OTP verification             |
| `/api/auth/resend-otp`                   | POST             | Resend OTP                   |
| `/api/auth/forgot-password`              | POST             | Password reset request       |
| `/api/auth/reset-password`               | POST             | Password reset execution     |
| `/api/auth/refresh`                      | POST             | Token refresh                |
| `/api/auth/signout`                      | POST             | Logout                       |
| `/api/profile`                           | GET, PUT         | User profile CRUD            |
| `/api/profile/location`                  | PUT              | Update user location         |
| `/api/profile/avatar`                    | PUT              | Update profile picture       |
| `/api/profile/availability`              | PUT              | Update donor availability    |
| `/api/blood-requests`                    | GET, POST        | List/create blood requests   |
| `/api/blood-requests/[id]`               | GET, PUT, DELETE | Single request operations    |
| `/api/blood-requests/[id]/donate`        | POST             | Respond to blood request     |
| `/api/blood-requests/[id]/complete`      | PUT              | Mark request complete        |
| `/api/blood-donations`                   | GET              | List blood donations         |
| `/api/blood-donations/[id]/mark-donated` | PUT              | Mark donation complete       |
| `/api/blood-donations/[id]/confirm`      | PUT              | Confirm donation             |
| `/api/fundraisers`                       | GET, POST        | List/create fundraisers      |
| `/api/fundraisers/[id]`                  | GET, PUT, DELETE | Single fundraiser operations |
| `/api/fundraisers/[id]/donate`           | POST             | Donate to fundraiser         |
| `/api/donations`                         | GET              | List financial donations     |
| `/api/locations/countries`               | GET              | List countries               |
| `/api/locations/cities`                  | GET              | List cities by country       |
| `/api/locations/areas`                   | GET              | List areas by city           |
| `/api/locations/reverse-geocode`         | GET              | Reverse geocoding            |
| `/api/notifications`                     | GET, POST        | Notification CRUD            |
| `/api/notifications/preferences`         | GET, PUT         | Notification settings        |
| `/api/notifications/register`            | POST             | Register device token        |
| `/api/leaderboard`                       | GET              | Get donor leaderboard        |
| `/api/config`                            | GET              | Get app configuration        |
| `/api/ads/config`                        | GET              | Get ad configuration         |
| `/api/payments/initiate`                 | POST             | Initialize payment           |
| `/api/payments/verify`                   | POST             | Verify payment               |
| `/api/upload/image`                      | POST             | Upload image                 |
| `/api/upload/document`                   | POST             | Upload document              |
| `/api/campaigns`                         | GET              | List marketing campaigns     |
| `/api/campaigns/[id]/track`              | POST             | Track campaign interaction   |

### Admin Pages (`src/app/admin/`)

| Page                 | Route                     | Description                    |
| -------------------- | ------------------------- | ------------------------------ |
| **Dashboard**        | `/admin/dashboard`        | Overview stats and charts      |
| **Users**            | `/admin/users`            | List, view, edit, delete users |
| **Blood Requests**   | `/admin/blood-requests`   | Manage all blood requests      |
| **Donations**        | `/admin/donations`        | View donation records          |
| **Fundraisers**      | `/admin/fundraisers`      | Manage fundraising campaigns   |
| **Moderators**       | `/admin/moderators`       | Add/remove moderators          |
| **Notifications**    | `/admin/notifications`    | Send push notifications        |
| **Locations**        | `/admin/locations`        | Manage countries/cities/areas  |
| **Email**            | `/admin/email`            | Email templates and sending    |
| **Ads**              | `/admin/ads`              | Configure ad placements        |
| **Reports**          | `/admin/reports`          | Analytics and reports          |
| **Payment Settings** | `/admin/payment-settings` | Payment gateway config         |
| **Settings**         | `/admin/settings`         | App-wide settings              |
| **Profile**          | `/admin/profile`          | Admin profile management       |

### Components (`src/components/`)

| Directory    | Contents                                                                      |
| ------------ | ----------------------------------------------------------------------------- |
| `ui/`        | shadcn/ui components (Button, Card, Dialog, Form, Input, Select, Table, etc.) |
| `layout/`    | AdminSidebar, AdminHeader, DashboardLayout, StatCard, ChartComponents         |
| `auth/`      | LoginForm, RegisterForm, AuthGuard                                            |
| `reactbits/` | Custom animated components (Aurora, SplitText, TiltCard)                      |

### Libraries (`src/lib/`)

| File                   | Purpose                                                  |
| ---------------------- | -------------------------------------------------------- |
| `api-utils.ts`         | API request helpers, error handling, response formatting |
| `auth/admin.ts`        | Firebase Admin SDK initialization                        |
| `auth/auth.helpers.ts` | Token verification, user creation utilities              |
| `auth/session.ts`      | Cookie-based session management                          |
| `db/mongodb.ts`        | MongoDB connection singleton                             |
| `email/smtp.ts`        | SMTP configuration and email sending                     |
| `onesignal.ts`         | OneSignal API wrapper for push notifications             |
| `rbac.ts`              | Role-based access control (admin, moderator checks)      |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account
- Firebase project with Admin SDK
- OneSignal account (for push notifications)
- Google Cloud project (for Maps API)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/BloodReq.git
   cd BloodReq/bloodreq-admin
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.template` to `.env` and fill in the values:

   ```bash
   cp .env.template .env
   ```

4. **Seed the database (optional)**
   ```bash
   npx ts-node scripts/seed-countries.ts
   npx ts-node scripts/seed-locations.ts
   ```

### Environment Variables

| Variable                          | Description                          |
| --------------------------------- | ------------------------------------ |
| `MONGODB_URI`                     | MongoDB Atlas connection string      |
| `MONGODB_DB_NAME`                 | Database name (default: `bloodreq`)  |
| `FIREBASE_PROJECT_ID`             | Firebase project ID                  |
| `FIREBASE_CLIENT_EMAIL`           | Firebase service account email       |
| `FIREBASE_PRIVATE_KEY`            | Firebase service account private key |
| `ONESIGNAL_APP_ID`                | OneSignal app ID                     |
| `ONESIGNAL_REST_API_KEY`          | OneSignal REST API key               |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key                  |
| `PLESK_FILE_SERVER_URL`           | File storage server URL              |
| `PLESK_UPLOAD_API_KEY`            | File storage API key                 |
| `GOOGLE_WEB_CLIENT_ID`            | Google OAuth client ID               |

### Running the App

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

The app will be available at `http://localhost:3000`

---

## 🔐 Authentication

### Firebase Admin SDK

Firebase Admin SDK is used for:

- Token verification (mobile app authentication)
- User creation and management
- Custom claims for RBAC

Configuration in `src/lib/auth/admin.ts`

### Session Management

- Sessions are stored in HTTP-only cookies
- Token refresh handled automatically
- RBAC middleware in `src/lib/rbac.ts`

### Roles

| Role        | Permissions                             |
| ----------- | --------------------------------------- |
| `admin`     | Full access to all features             |
| `moderator` | Limited access (manage requests, users) |
| `user`      | Mobile app access only                  |

---

## 📊 Database Schema

MongoDB collections are documented in `mongodb_structure.md`:

| Collection        | Description                        |
| ----------------- | ---------------------------------- |
| `users`           | User profiles and authentication   |
| `blood_requests`  | Blood donation requests            |
| `blood_donations` | Donation records (donor responses) |
| `fundraisers`     | Fundraising campaigns              |
| `donations`       | Financial donations                |
| `notifications`   | Push notification history          |
| `locations`       | Countries, cities, areas           |
| `config`          | App configuration                  |
| `ads`             | Ad configuration                   |
| `campaigns`       | Marketing campaigns                |

---

## 🔔 Push Notifications

OneSignal is integrated for push notifications:

- Blood request alerts by blood type and location
- Donation status updates
- Fundraiser campaign updates
- Admin broadcast messages

API wrapper in `src/lib/onesignal.ts`

---

## 🌍 Internationalization

The app supports multiple languages using `next-intl`:

| Language | Code | File               |
| -------- | ---- | ------------------ |
| English  | `en` | `messages/en.json` |
| Hindi    | `hi` | `messages/hi.json` |
| Bengali  | `bn` | `messages/bn.json` |
| Odia     | `or` | `messages/or.json` |
| Marathi  | `mr` | `messages/mr.json` |

Configuration in `i18n.ts` and `src/i18n/request.ts`

---

## 📦 Dependencies

### Production Dependencies

```json
{
  "next": "16.1.1",
  "react": "19.2.3",
  "mongodb": "^7.0.0",
  "firebase": "^12.8.0",
  "firebase-admin": "^13.6.0",
  "next-intl": "^4.7.0",
  "next-themes": "^0.4.6",
  "@radix-ui/react-*": "latest",
  "react-hook-form": "^7.71.0",
  "zod": "^4.3.5",
  "framer-motion": "^12.25.0",
  "gsap": "^3.14.2",
  "lucide-react": "^0.562.0",
  "nodemailer": "^7.0.12",
  "sonner": "^2.0.7"
}
```

### Dev Dependencies

```json
{
  "typescript": "^5",
  "tailwindcss": "^4",
  "@tailwindcss/postcss": "^4",
  "eslint": "^9",
  "eslint-config-next": "16.1.1"
}
```

---

## 🧪 Scripts

| Script          | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |

---

## 📄 License

This project is proprietary. All rights reserved.

---

## 👥 Contributors

- **BloodReq Team** - Development and Design

---

<p align="center">Made with ❤️ to save lives</p>
