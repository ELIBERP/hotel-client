# Environment Variables Security Guide

## 🔒 Security Rules for Environment Variables

### ✅ SAFE for Client-Side (VITE_ prefix)
These are embedded in the client bundle and visible to users:

```bash
# API endpoints (public anyway)
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_API_TIMEOUT=10000

# App metadata
VITE_APP_NAME=StayEase
VITE_APP_VERSION=1.0.0

# Feature flags
VITE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=true
```

### ❌ NEVER expose these in VITE_ variables:
```bash
# Database credentials
DATABASE_PASSWORD=secret123

# API keys for third-party services
STRIPE_SECRET_KEY=sk_live_...
SENDGRID_API_KEY=SG....

# JWT secrets
JWT_SECRET=your-secret-key

# Private keys
PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
```

## 📁 Environment File Priority

Vite loads environment variables in this order (highest priority first):

1. `.env.local` (always ignored by git)
2. `.env.[mode].local` (e.g., `.env.development.local`)
3. `.env.[mode]` (e.g., `.env.development`)
4. `.env`

## 🛡️ Security Checklist

- [x] All sensitive variables are NOT prefixed with `VITE_`
- [x] `.env.local` is in `.gitignore`
- [x] No hardcoded secrets in code
- [x] Environment variables are validated
- [x] Different configs for dev/staging/production

## 📋 Usage Examples

### In your components:
```javascript
import config from '../config/env.js';

// ✅ Safe - using the config helper
const apiUrl = config.apiBaseUrl;

// ❌ Avoid - direct import.meta.env usage
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

### For API calls:
```javascript
import { buildApiUrl } from '../config/env.js';

// ✅ Good - centralized URL building
const response = await fetch(buildApiUrl('/hotels'));
```

## 🚀 Production Deployment

### Vercel:
```bash
# Set in Vercel dashboard
VITE_API_BASE_URL=https://your-production-api.com/api
```

### Netlify:
```bash
# Set in Netlify environment variables
VITE_API_BASE_URL=https://your-production-api.com/api
```

### Docker:
```dockerfile
# In Dockerfile
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
```

## 🔍 Debugging

Enable debug mode to see API calls:
```bash
# In .env.local
VITE_DEBUG_MODE=true
```

## 📚 Best Practices

1. **Validate environment variables** on app startup
2. **Use fallbacks** for non-critical variables
3. **Document** all environment variables in `.env.example`
4. **Keep secrets on the server** - use API endpoints instead
5. **Use HTTPS** in production for all API calls
