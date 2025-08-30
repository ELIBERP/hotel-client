# HotelClient - Modern Hotel Booking Platform 🏨

![Node.js](https://img.shields.io/badge/Node.js-v20-green)
![React](https://img.shields.io/badge/React-v19.1.0-blue)
![Vite](https://img.shields.io/badge/Vite-v6.3.5-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.1.11-38B2AC)

A modern, responsive hotel booking application built with React 19, Vite, and Tailwind CSS. This project features a comprehensive hotel search system with autocomplete, date range selection, room booking, and payment integration.

![Hotel Client Demo](public/hotel.svg)

## ✨ Features

- **🔍 Advanced Hotel Search** with fuzzy matching and autocomplete
- **📅 Date Range Selection** with validation for check-in and check-out
- **👥 Guest and Room Selection** interface
- **🏨 Hotel Listings** with filtering and sorting options
- **🛏️ Detailed Hotel Views** with room information and pricing
- **💳 Booking System** with user accounts and guest booking options
- **💰 Mock Payment Integration** (ready for real payment gateway)
- **📱 Responsive Design** for all device sizes
- **🐳 Dockerized** for easy deployment

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or later
- npm 10.x or later

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ELIBERP/hotel-client.git
   cd hotel-client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_API_BASE_URL=http://localhost:3000/api
   VITE_API_TIMEOUT=10000
   VITE_APP_NAME=StayEase
   VITE_APP_VERSION=1.0.0
   VITE_GOOGLEMAP_API_KEY=your_google_maps_api_key
   VITE_GOOGLEMAP_MAP_ID=your_google_map_id
   VITE_DEBUG_MODE=true
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with watch mode
npm run test:watch

# Generate test coverage
npm run test:coverage
```

### Docker Deployment

The project includes Docker configuration for easy deployment:

```bash
# Build the Docker image
docker build -t hotel-client .

# Run the container
docker run -p 8080:80 hotel-client
```

## 🏗️ Project Structure

```
src/
├── assets/          # Static files and resources
│   ├── hotel.svg
│   ├── react.svg
│   └── assets.js    # Asset exports
├── components/      # Reusable UI components
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── SearchBar.jsx
│   └── ...
├── config/          # Configuration files
│   └── env.js       # Environment variable handling
├── pages/           # Application pages/routes
│   ├── LandingContent.jsx
│   ├── HotelDetails.jsx
│   ├── About.jsx
│   ├── Stays.jsx
│   └── ...
├── services/        # API services and utilities
│   └── api.js       # Centralized API service
├── App.jsx          # Main application component
├── main.jsx        # Application entry point
├── App.css         # Global styles
└── index.css       # Base styles with Tailwind imports
```

## 💻 Technologies Used

- **Frontend Framework**: React 19.1.0
- **Build Tool**: Vite 6.3.5
- **Routing**: React Router 7.6.3
- **Styling**: Tailwind CSS 4.1.11
- **Search Technology**: fuzzysort for advanced matching
- **Maps Integration**: Google Maps API
- **Testing**: Jest 30.0.5 with React Testing Library
- **CI/CD**: GitHub Actions
- **Containerization**: Docker

## 📁 Directory Breakdown

- **`assets/`** - Static resources such as SVGs, PNGs, and other media files
- **`components/`** - Reusable UI elements across the application
- **`pages/`** - Components representing different application routes
- **`services/`** - API communication with the backend
- **`config/`** - Configuration files for environment variables and app settings

## 🛠️ Available Commands

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint for code quality

# Testing
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate test coverage report
```

## 🐛 Common Issues & Solutions

### CORS Errors
If you encounter CORS errors when connecting to the backend:

1. **Backend Solution**: Ensure CORS middleware is added to your backend server
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
- Check that `.env` is in the project root directory

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
2. **Environment Setup**: Configure your `.env` file
3. **Start Development**: `npm run dev`
4. **Code & Test**: Make changes and test in browser
5. **Lint Code**: `npm run lint`
6. **Build Test**: `npm run build` to ensure production builds work
7. **Commit & Push**: Follow conventional commit messages

## � Key Features Explained

### Advanced Hotel Search

The search functionality uses a combination of exact matching and fuzzy matching powered by the fuzzysort library. This provides a sophisticated autocomplete experience that can handle typos and partial matches:

- Debounced input to prevent excessive API calls
- Prioritization of popular destinations
- Fallback to fuzzy matching for better user experience
- Static destination data for offline functionality

### Date Selection and Validation

The application includes robust date selection with built-in validation:

- Prevention of past dates for check-in
- Enforcing minimum stay requirements
- Automatic adjustment of check-out when check-in changes
- Clear error messaging

### Responsive Design

The application is built with a mobile-first approach using Tailwind CSS:

- Fully responsive across all device sizes
- Custom breakpoints for optimal layout
- Accessible UI components

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_BASE_URL | Base URL for API endpoints | http://localhost:3000 |
| VITE_API_TIMEOUT | Timeout for API requests (ms) | 10000 |
| VITE_GOOGLEMAP_API_KEY | Google Maps API key | - |
| VITE_GOOGLEMAP_MAP_ID | Google Maps custom map style ID | - |

## �📚 Additional Documentation

- [Environment Variables Guide](./docs/ENVIRONMENT_VARIABLES.md) - Detailed setup guide
- [API Service Documentation](./docs/API_SERVICE.md) - Complete guide to using the API service

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🆘 Need Help?

1. Check the documentation in the `docs` directory
2. Review console errors in browser developer tools
3. Ensure backend server is running and accessible
4. Verify all environment variables are properly set

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Design inspiration from major hotel booking platforms
- Icons from [Phosphor Icons](https://phosphoricons.com/)
- Map styling from Google Maps Platform

---

**Happy Coding! 🚀**
