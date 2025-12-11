<div align="center">
  <h1>🐾 PET4U - Pet Adoption Platform</h1>
  <p>
    <strong>Modern full-stack pet adoption platform connecting shelters with adopters</strong>
  </p>
  
  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#deployment">Deployment</a> •
    <a href="#contributing">Contributing</a>
  </p>

  ![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
  ![License](https://img.shields.io/badge/license-MIT-green.svg)
  ![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
  ![Next.js](https://img.shields.io/badge/Next.js-14-black)
</div>

---

## 📖 Overview

**PET4U** is a comprehensive pet adoption platform designed to streamline the adoption process by connecting animal shelters with potential adopters. Built with modern technologies, it provides real-time messaging, advanced search capabilities, and a complete adoption workflow management system. [web:74]

### 🎯 Problem Statement

Traditional pet adoption processes are often fragmented, requiring multiple visits, phone calls, and paperwork. PET4U solves this by providing a centralized platform where:
- Shelters can manage their pets and adoption requests efficiently
- Adopters can browse, favorite, and request adoptions seamlessly
- Both parties can communicate in real-time
- Admins can monitor and manage the entire ecosystem

---

## ✨ Features

### For Adopters 🏠
- ✅ **Browse Pets** - Explore available pets with detailed profiles and images
- ✅ **Advanced Search** - Filter by species, breed, age, location, behavior traits, and more
- ✅ **Favorites System** - Save pets you're interested in for later
- ✅ **Adoption Requests** - Send adoption requests with personalized messages
- ✅ **Real-time Messaging** - Chat directly with shelters
- ✅ **Request Tracking** - Monitor the status of your adoption applications
- ✅ **Reviews & Ratings** - Review shelters and pets after adoption

### For Shelters 🏢
- ✅ **Pet Management** - Add, edit, and manage pet listings with multiple images
- ✅ **Request Management** - Review and respond to adoption requests
- ✅ **Meeting Scheduling** - Schedule meet-and-greets with potential adopters
- ✅ **Analytics Dashboard** - Track views, requests, and adoption metrics
- ✅ **Real-time Notifications** - Get instant alerts for new requests
- ✅ **Profile Management** - Showcase your shelter's mission and facilities

### For Admins 🛡️
- ✅ **User Management** - Monitor, suspend, or delete user accounts
- ✅ **Pet Moderation** - Review and manage all pet listings
- ✅ **Platform Analytics** - View comprehensive platform statistics
- ✅ **Activity Logs** - Track all administrative actions
- ✅ **Dashboard Overview** - Monitor platform health and activity

### Core Features 🔧
- ✅ **Real-time Chat** - Socket.IO powered instant messaging
- ✅ **Image Upload** - Cloudinary integration for optimized image storage
- ✅ **Email Notifications** - Automated email alerts for key actions
- ✅ **Responsive Design** - Mobile-first, works on all devices
- ✅ **Payment Integration** - Ready for adoption fee processing (Razorpay)
- ✅ **Security** - JWT authentication, rate limiting, input sanitization

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Next.js 14** | React framework with App Router |
| **React 18** | UI library |
| **Redux Toolkit** | State management |
| **TailwindCSS** | Utility-first CSS framework |
| **ShadCN UI** | Pre-built accessible components |
| **Socket.IO Client** | Real-time communication |
| **Axios** | HTTP client |
| **date-fns** | Date formatting |
| **Sonner** | Toast notifications |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | Web framework |
| **Drizzle ORM** | Type-safe database toolkit |
| **Neon PostgreSQL** | Serverless PostgreSQL database |
| **Redis** | Caching and session management |
| **Socket.IO** | Real-time bidirectional communication |
| **JWT** | Authentication tokens |
| **Bcrypt** | Password hashing |
| **Cloudinary** | Image storage and optimization |
| **Nodemailer** | Email service |
| **Winston** | Logging |

### Security & Performance
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **express-mongo-sanitize** - Input sanitization
- **hpp** - HTTP parameter pollution prevention
- **xss-clean** - XSS attack prevention
- **Compression** - Response compression



