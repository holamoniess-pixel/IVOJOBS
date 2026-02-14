# 2026 IVOJOBS

IVO JOBS is a modern, professional networking and hiring platform designed to connect top talent with forward-thinking companies. Built with a sleek glassmorphism UI and powered by AI, it offers a seamless experience for both job seekers and recruiters.

## 🚀 Features

- **Professional Networking**: Create a professional profile and showcase your skills.
- **Job Board**: Post and search for job openings in real-time.
- **AI Assistant**: Chat with the IVO Assistant (powered by Google Gemini) for navigation and help.
- **Secure Auth**: JWT-based authentication for secure access.
- **Modern UI**: Responsive design with liquid glass animations.

## 🛠 Technology Stack

- **Frontend**: HTML5, CSS3 (Glassmorphism), JavaScript (Vanilla)
- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas
- **AI**: Google Generative AI (Gemini Pro)
- **Deployment**: Netlify (Frontend), Heroku/Render/Self-hosted (Backend)

## 📦 Setup Instructions

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas account
- Google Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Goshenclothing/2026-IVOJOBS.git
   cd 2026-IVOJOBS
   ```

2. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the `server` directory:
   ```env
   PORT=4000
   MONGO_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Run the application:
   ```bash
   # From the server directory
   npm start
   ```

## 🤝 Contributing

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a pull request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
Built with ❤️ by the IVO Team.
