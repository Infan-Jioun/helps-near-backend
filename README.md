# 🚨 Helps Near — Backend

Helps Near is an emergency response platform where users can report emergencies and volunteers can respond to help them. The platform supports real-time emergency management, volunteer coordination, and secure payments.

---

## 🌐 Live URL

```
https://helps-near-backend.vercel.app
```

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL (Neon)
- **Authentication:** Better Auth
- **Payment:** Stripe
- **Validation:** Zod
- **Deployment:** Vercel

---

## ✨ Features

- User registration and login with email verification
- Role-based access control (USER, VOLUNTEER, ADMIN)
- Emergency creation and management
- Volunteer response system
- Stripe payment integration
- Admin dashboard for managing users and volunteers
- Volunteer profile management and verification

---

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| USER | Create emergencies, make payments, view volunteers |
| VOLUNTEER | Accept emergencies, manage profile, view assigned emergencies |
| ADMIN | Manage all users, verify volunteers, view all data |

---

## 📦 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sign-up/email` | Register new user |
| POST | `/api/auth/sign-in/email` | Login user |
| POST | `/api/auth/sign-out` | Logout user |

### Emergency
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/emergency` | Create emergency |
| GET | `/api/emergency` | Get all emergencies |
| GET | `/api/emergency/:id` | Get single emergency |
| PATCH | `/api/emergency/:id` | Update emergency |
| DELETE | `/api/emergency/:id` | Delete emergency |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get my profile |
| PATCH | `/api/users/me` | Update my profile |
| GET | `/api/users` | Get all users (Admin) |
| GET | `/api/users/:id` | Get single user (Admin) |
| PATCH | `/api/users/:id/role` | Update user role (Admin) |
| PATCH | `/api/users/:id/status` | Update user status (Admin) |

### Volunteer
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/volunteers/create-volunteer` | Create volunteer (Admin) |
| GET | `/api/volunteers` | Get all volunteers |
| GET | `/api/volunteers/:userId` | Get single volunteer |
| GET | `/api/volunteers/my/profile` | Get my volunteer profile |
| PATCH | `/api/volunteers/my/profile` | Update my volunteer profile |
| PATCH | `/api/volunteers/:userId/verify` | Verify volunteer (Admin) |
| DELETE | `/api/volunteers/:userId` | Delete volunteer (Admin) |

### Volunteer Response
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/volunteer-response/:emergencyId` | Accept emergency |
| GET | `/api/volunteer-response/my` | Get my responses |
| GET | `/api/volunteer-response/:emergencyId` | Get emergency responses |
| DELETE | `/api/volunteer-response/:emergencyId` | Cancel response |

### Payment
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/create-intent` | Create Stripe payment intent |
| GET | `/api/payment/confirm/:paymentIntentId` | Confirm payment |
| GET | `/api/payment/my` | Get my payments |
| GET | `/api/payment` | Get all payments (Admin) |

---

## 🚀 Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/helps-near-backend.git
cd helps-near-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env` file

```env
NODE_ENV=development
PORT=5000

DATABASE_URL=your_neon_pooled_url
DIRECT_URL=your_neon_direct_url

BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### 4. Generate Prisma client and push schema

```bash
npx prisma generate
npx prisma db push
```

### 5. Start the server

```bash
npm run dev
```

Server will run on `http://localhost:5000`

---

## 🔐 Admin Credentials

```
Email    : admin@helpsnear.com
Password : admin123
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── module/
│   │   ├── emergency/
│   │   ├── user/
│   │   ├── volunteer/
│   │   ├── volunteerResponse/
│   │   └── payment/
│   ├── errorHelper/
│   ├── interface/
│   ├── lib/
│   └── utils/
├── config/
├── middleware/
├── generated/
└── server.ts
```

---




## 📄 License

This project is for educational purposes only.
