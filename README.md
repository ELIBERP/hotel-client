# StayEase Hotel Booking Client 🏨

A modern React hotel booking application built with Vite, Tailwind CSS v4, and React Router for seamless hotel search and booking experiences.

## 🏗️ Project Structure

```
src/
├── assets/          # Static files (SVGs, PNGs, images)
│   ├── hotel.svg
│   ├── react.svg
│   └── assets.js
├── components/      # Reusable UI components
│   ├── Header.jsx
│   ├── Footer.jsx
│   └── SearchBar.jsx
├── pages/          # Application pages/routes
│   ├── LandingContent.jsx
│   ├── About.jsx
│   └── Stays.jsx
├── services/       # Backend API integration
│   └── api.js
├── config/         # Configuration files
│   └── env.js
├── App.jsx         # Main application component
├── main.jsx        # Application entry point
├── App.css         # Global styles
└── index.css       # Base styles with Tailwind imports
```

### 📁 Directory Breakdown

- **`assets/`** - Store all relevant static items such as SVGs, PNGs, and other media files
- **`components/`** - Isolate and make UI elements reusable across the application
- **`pages/`** - Contains all the page components that represent different routes
- **`services/`** - Handles API communication and allows the app to connect to the backend
- **`config/`** - Configuration files for environment variables and app settings

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Backend server running on `localhost:3000` (or configured URL)

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd hotel-client

# Install dependencies
npm install
```

### 2. Environment Setup

Create your environment configuration file:

```bash
# Copy the example environment file
cp .env.example .env.local
```

Edit `.env.local` with your settings:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=StayEase
VITE_APP_VERSION=1.0.0

# Optional: Debug mode (shows API requests in console)
VITE_DEBUG_MODE=true

# Optional: API timeout (milliseconds)
VITE_API_TIMEOUT=10000
```

> 📚 **For detailed environment variable setup and security guidelines, see [Environment Variables Documentation](./docs/ENVIRONMENT_VARIABLES.md)**

### 3. Start Development Server

```bash
# Start the development server
npm run dev

# Server will run on http://localhost:5173
```

### 4. Backend Integration

Ensure your backend server is running and accessible. The frontend expects:

- **Base URL**: `http://localhost:3000/` (configurable via `VITE_API_BASE_URL`)
- **CORS**: Backend must allow requests from `http://localhost:5173`

## 🛠️ Available Commands

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint for code quality

# Environment Management
cp .env.example .env.local     # Create local environment file
```

## 🎨 Technologies Used

- **React 19** - Frontend framework
- **Vite** - Build tool and development server
- **Tailwind CSS v4** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **ESLint** - Code linting and formatting

## 📱 Features

- **🔍 Hotel Search** - Search hotels by destination
- **🧭 Navigation** - Multi-page routing (Home, Stays, About)
- **📱 Responsive Design** - Mobile-first responsive UI
- **🔌 API Integration** - RESTful API communication
- **⚙️ Environment Configuration** - Flexible environment setup
- **🎯 Reusable Components** - Modular and maintainable codebase

## 🐛 Common Issues & Solutions

### CORS Errors
If you encounter CORS errors when connecting to the backend:

1. **Backend Solution**: Ensure CORS middleware is added to your backend server (We have implemented this in the backend)
2. **Development Workaround**: Use a proxy in `vite.config.js`:

```javascript
export default defineConfig({
  // ...existing config
  server: {
    proxy: {
      '/': 'http://localhost:3000'
    }
  }
})
```

### Environment Variables Not Loading
- Ensure variables are prefixed with `VITE_`
- Restart the development server after changing `.env` files
- Check that `.env.local` is in the project root directory

### Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

## 🤝 Development Workflow

1. **Create Feature Branch**: `git checkout -b feature/your-feature`
2. **Environment Setup**: Copy and configure `.env.local`
3. **Start Development**: `npm run dev`
4. **Code & Test**: Make changes and test in browser
5. **Lint Code**: `npm run lint`
6. **Build Test**: `npm run build` to ensure production builds work
7. **Commit & Push**: Follow conventional commit messages

## 📚 Additional Documentation

- [Environment Variables Guide](./docs/ENVIRONMENT_VARIABLES.md) - Detailed security and setup guide
- [API Service Documentation](./docs/API_SERVICE.md) - Complete guide to using the API service
- [Component Documentation](./src/components/) - Reusable component library

## 🆘 Need Help?

1. Check the [Environment Variables Documentation](./docs/ENVIRONMENT_VARIABLES.md)
2. Review console errors in browser developer tools
3. Ensure backend server is running and accessible
4. Verify all environment variables are properly set

---

**Happy Coding! 🚀**
