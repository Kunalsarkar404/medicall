# 🩺 Medicall — Your Mobile Healthcare Companion

**Medicall** is a full-stack doctor appointment booking platform built with a modern tech stack using **Next.js 15** for the frontend and **Express.js** for the backend. It offers a mobile-first experience focused on real-time booking, easy access to doctors, and a minimal yet powerful MVP.

---

## 🚀 Tech Stack

### Frontend (`/client`)
- **Next.js 15 App Router**
- **TailwindCSS** for modern, responsive UI
- **Axios** or native `fetch` for API communication
- **Next/Image** for optimized profile loading

### Backend (`/server`)
- **Express.js**
- **JWT Authentication** for Doctors
- **Twilio OTP Authentication** for Users
- **MongoDB** (or PostgreSQL, depending on your DB choice)
- **CORS**, **dotenv**, and structured controller-routing

---

## 📱 Core Features

- 🔍 Browse verified doctors
- 📅 Book appointments easily
- 👤 User OTP login via Twilio
- 🩺 Doctor login with JWT tokens
- 🖼️ Profile picture fallback
- 🌐 Fully responsive UI (mobile-first)
- 🔐 Secure backend APIs with route protection

---

## 🧱 Project Structure
```
/medicall
│
├── /client       # Frontend (Next.js)
│   ├── app/
│   ├── components/
│   ├── public/
│   └── ...
│
├── /server       # Backend (Express.js)
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   └── ...
│
├── .gitignore
├── README.md
└── package.json

````
---

## ⚙️ Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/medicall.git
cd medicall
````

### 2. Install Dependencies

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

### 3. Run Locally

```bash
# Terminal 1: Frontend
cd client
npm run dev

# Terminal 2: Backend
cd server
npm run dev
```

---

## 🔐 Environment Variables

Set up environment variables in the following files:

```bash
client/.env.local
server/.env
```

### Example for `client/.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

### Example for `server/.env`

```env
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/vaishyaplus?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_12345
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
```

---

## 👨‍💻 Author

**Kunal Sarkar**
Full-Stack Developer & Builder
[LinkedIn](https://www.linkedin.com/in/kunalsarkar07)

---

## 🔭 Roadmap

* [ ] Doctor filtering & search
* [ ] Appointment history & dashboard
* [ ] SMS notifications via Twilio
* [ ] Role-based dashboard for Doctors
* [ ] Deployment on Vercel (client) & Render/Railway (server)
* [ ] Real-time booking slot management

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

> 🩺 **Medicall** — *Jab zarurat ho, hum saath hain.*

```
Let me know if you'd like to:

- Add deployment sections for **Vercel** + **Render**
- Auto-generate API docs (Swagger / Postman collection)
- Include badges (build passing, license, etc.)

This file is polished for a public GitHub repository and MVP stage clarity.
```