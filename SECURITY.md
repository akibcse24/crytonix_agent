# Crytonix Security Setup Guide

## 🔐 Security Features

Crytonix implements production-grade security:

### 1. **Authentication (NextAuth.js)**
- GitHub OAuth
- Google OAuth
- JWT sessions (30-day expiry)
- Protected routes

### 2. **API Key Encryption**
- AES-256-GCM encryption
- Secure key storage
- Auto-generated encryption keys

### 3. **Rate Limiting**
- Upstash Redis (distributed)
- In-memory fallback (development)
- 10 requests per 10 seconds per IP

### 4. **Input Validation**
- Zod schemas for all endpoints
- Type-safe request validation
- Detailed error messages

### 5. **CORS & Headers**
- Configurable allowed origins
- Security headers (XSS, nosniff, frame-deny)
- Preflight request handling

---

## 📝 Setup Instructions

### 1. Generate Secrets

```bash
# Generate NextAuth secret
openssl rand -base64 32

# Generate encryption key (32 bytes hex)
openssl rand -hex 32
```

Add to `.env.local`:
```env
NEXTAUTH_SECRET=<generated_secret>
ENCRYPTION_KEY=<generated_hex_key>
```

### 2. Configure OAuth Providers

#### GitHub OAuth:
1. Go to: https://github.com/settings/developers
2. Create New OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID & Secret to `.env.local`:

```env
GITHUB_ID=your_client_id
GITHUB_SECRET=your_client_secret
```

#### Google OAuth:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID & Secret to `.env.local`:

```env
GOOGLE_ID=your_client_id.apps.googleusercontent.com
GOOGLE_SECRET=your_client_secret
```

### 3. Set up Upstash Redis (Optional)

1. Create free account: https://upstash.com
2. Create Redis database
3. Copy REST URL & Token to `.env.local`:

```env
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

**Note:** If not configured, rate limiting falls back to in-memory storage.

### 4. Configure CORS

Add allowed origins to `.env.local`:

```env
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
```

---

## 🚀 Production Deployment

### Environment Variables (Required)

```env
# Base URL (IMPORTANT!)
NEXTAUTH_URL=https://your-domain.com

# Secrets (CRITICAL - generate new ones for production!)
NEXTAUTH_SECRET=<production_secret>
ENCRYPTION_KEY=<production_encryption_key>

# OAuth Providers
GITHUB_ID=<production_github_id>
GITHUB_SECRET=<production_github_secret>
GOOGLE_ID=<production_google_id>
GOOGLE_SECRET=<production_google_secret>

# Rate Limiting (Recommended)
UPSTASH_REDIS_REST_URL=<production_redis_url>
UPSTASH_REDIS_REST_TOKEN=<production_redis_token>

# CORS
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### Update OAuth Redirect URIs

For production, update callback URLs in:
- **GitHub**: `https://your-domain.com/api/auth/callback/github`
- **Google**: `https://your-domain.com/api/auth/callback/google`

---

## 🔒 Protected Routes

These routes require authentication:
- `/dashboard`
- `/agents`
- `/knowledge`
- `/tools`
- `/status`
- `/logs`

Unauthenticated users are redirected to `/auth/signin`.

---

## 🛡️ Security Best Practices

1. **Never commit secrets** - use `.env.local` (gitignored)
2. **Rotate keys regularly** - especially after team changes
3. **Use Upstash Redis** in production for distributed rate limiting
4. **Monitor rate limits** - adjust per your API usage
5. **Keep dependencies updated** - run `npm audit` regularly

---

## 🧪 Testing

### Test Authentication:
1. Visit: http://localhost:3000/dashboard
2. Should redirect to `/auth/signin`
3. Click "Continue with GitHub/Google"
4. Authorize app
5. Should redirect back to dashboard

### Test Rate Limiting:
```bash
# Send multiple requests quickly
for i in {1..15}; do curl http://localhost:3000/api/status; done
```

Expected: First 10 succeed, rest return 429 (rate limit exceeded)

---

## 📚 API Validation Examples

All API endpoints use Zod validation:

```typescript
// Example: POST /api/agent/chat
{
  "message": "Hello", // Required, 1-10000 chars
  "agentConfig": {
    "provider": "openai", // Enum: openai|anthropic|groq|google|ollama
    "model": "gpt-4o-mini",
    "temperature": 0.7, // 0-2
    "maxTokens": 2000 // 1-100000
  },
  "tools": ["calculator", "web_search"]
}
```

Invalid requests return:
```json
{
  "error": "Validation failed",
  "details": ["message: Message cannot be empty"]
}
```

---

## 🆘 Troubleshooting

### Error: "API key for provider not found"
- Check `.env.local` has correct API keys
- Restart dev server after adding keys

### Error: "Invalid callback URL"
- Ensure OAuth redirect URIs match exactly
- Check `NEXTAUTH_URL` in `.env.local`

### Error: "Rate limit exceeded"
- Wait 10 seconds or clear rate limit
- Configure Upstash Redis for better control

### Sessions not persisting
- Check `NEXTAUTH_SECRET` is set
- Clear browser cookies
- Check `NEXTAUTH_URL` matches your domain

---

For more help, see: https://next-auth.js.org/getting-started
