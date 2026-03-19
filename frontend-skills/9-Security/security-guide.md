# Frontend Security Guide

## Authentication & Authorization

### 1. Secure Authentication Pattern

```typescript
// lib/auth.ts
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export async function verifyAuth(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as User;
  } catch {
    return null;
  }
}

// middleware.ts - Protect routes
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const user = await verifyAuth(token);
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Add user to request
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', user.id);

  return NextResponse.next({
    request: { headers: requestHeaders }
  });
}

export const config = {
  matcher: ['/api/protected/:path*', '/dashboard/:path*']
};
```

### 2. Secure Token Storage

```typescript
// ❌ Never store in localStorage (XSS vulnerable)
localStorage.setItem('token', authToken);

// ✅ Use httpOnly cookies (secure standard)
// Set from server
response.setHeader('Set-Cookie', 
  `auth-token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`
);

// ✅ Use cookies in client code
import Cookies from 'js-cookie';

// Token is sent automatically with credentials
const response = await fetch('/api/protected', {
  credentials: 'include' // Send cookies
});
```

## Input Validation & Sanitization

### 1. Server-Side Validation

```typescript
// lib/validation.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password too short')
});

export type LoginInput = z.infer<typeof loginSchema>;

// API route
import { loginSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const data = loginSchema.parse(body);
    
    // Process validated data
    const user = await authenticateUser(data.email, data.password);
    
    return Response.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { errors: error.errors }, 
        { status: 400 }
      );
    }
    throw error;
  }
}
```

### 2. HTML Sanitization

```typescript
import DOMPurify from 'dompurify';

// Never render untrusted HTML directly
function UserComment({ content }: { content: string }) {
  // ❌ Vulnerable to XSS
  // return <div dangerouslySetInnerHTML={{ __html: content }} />;

  // ✅ Sanitize before rendering
  const cleanHTML = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'a', 'p'],
    ALLOWED_ATTR: ['href']
  });

  return <div dangerouslySetInnerHTML={{ __html: cleanHTML }} />;
}
```

### 3. SQL Injection Prevention

```typescript
// ❌ Never construct queries manually
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Use parameterized queries
import { db } from '@/lib/db';

const user = await db.user.findUnique({
  where: { email }, // Prisma handles escaping
});

// OR with raw SQL
const result = await db.$queryRaw`
  SELECT * FROM users WHERE email = ${email}
`;
```

## CSRF Prevention

```typescript
// lib/csrf.ts
import { generateToken, verifyToken } from 'csrf';

export function generateCsrfToken() {
  const token = generateToken();
  return token;
}

export function verifyCsrfToken(token: string): boolean {
  return verifyToken(token);
}

// Middleware
export async function withCSRFProtection(request: NextRequest) {
  if (request.method !== 'GET') {
    const token = request.headers.get('x-csrf-token');
    
    if (!token || !verifyCsrfToken(token)) {
      return Response.json(
        { error: 'CSRF verification failed' }, 
        { status: 403 }
      );
    }
  }
}

// In forms
export function CSRFForm({ children }: { children: ReactNode }) {
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    // Get CSRF token from server
    fetch('/api/csrf-token')
      .then(r => r.json())
      .then(({ token }) => setCsrfToken(token));
  }, []);

  return (
    <form method="POST">
      <input type="hidden" name="_csrf" value={csrfToken} />
      {children}
    </form>
  );
}
```

## Content Security Policy (CSP)

```typescript
// next.config.ts
export default {
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",              // Default: same origin
            "script-src 'self' 'unsafe-inline' https://cdn.example.com", // Scripts
            "style-src 'self' 'unsafe-inline'",            // Styles
            "img-src 'self' data: https:",                 // Images
            "font-src 'self' data:",                       // Fonts
            "connect-src 'self' https://api.example.com", // API calls
            "frame-ancestors 'none'"                       // No iframes
          ].join('; ')
        }
      ]
    }
  ]
};
```

## Secure API Communication

### 1. HTTPS Only

```typescript
// next.config.ts
export default {
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains; preload'
        }
      ]
    }
  ]
};
```

### 2. Rate Limiting

```typescript
// lib/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
});

export async function checkRateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier);
  return success;
}

// In API route
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  
  if (!(await checkRateLimit(ip))) {
    return Response.json(
      { error: 'Too many requests' }, 
      { status: 429 }
    );
  }

  // Process request
}
```

## Secure Data Handling

### 1. Environment Variables

```bash
# .env.local (NEVER commit)
DATABASE_URL=postgresql://...
API_SECRET=secret123
STRIPE_API_KEY=sk_live_...

# .env.production (secure values only)
NEXT_PUBLIC_API_URL=https://api.example.com
```

```typescript
// ✅ Only expose NEXT_PUBLIC_ to client
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// ❌ Server secrets never in client code
// const secret = process.env.API_SECRET; // NOT in client component!

// ✅ Use in server action
'use server';

export async function sensitiveAction() {
  const secret = process.env.API_SECRET; // Safe here
  // Process...
}
```

### 2. Encryption

```typescript
import crypto from 'crypto';

function encryptData(data: string, key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key), iv);
  
  let encrypted = cipher.update(data, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
}

function decryptData(encrypted: string, key: string): string {
  const [ivHex, encryptedHex, authTagHex] = encrypted.split(':');
  
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(key),
    Buffer.from(ivHex, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  
  return decrypted;
}
```

## Dependency Security

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Scan dependencies
npm install -g snyk
snyk test

# Keep dependencies updated
npm update
npx npm-check-updates -u
```

## OWASP Top 10 Checklist

- [ ] **A1: Injection** - Use parameterized queries, validate input
- [ ] **A2: Authentication** - Strong auth, MFA, secure password storage
- [ ] **A3: Sensitive Data** - Encrypt data at rest, use HTTPS
- [ ] **A4: XML External Entities (XXE)** - Disable XML external entities
- [ ] **A5: Broken Access Control** - Check authorization on server
- [ ] **A6: Security Misconfiguration** - Use security headers
- [ ] **A7: XSS** - Sanitize output, use CSP
- [ ] **A8: Insecure Deserialization** - Validate serialized data
- [ ] **A9: Using Components with Known Vulnerabilities** - Keep deps updated
- [ ] **A10: Insufficient Logging & Monitoring** - Log security events

## Security Headers

```typescript
// next.config.ts
export default {
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=()' }
      ]
    }
  ]
};
```

## Resources

- [OWASP Web Security](https://owasp.org/www-project-top-ten/)
- [MDN Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [NIST Cybersecurity](https://www.nist.gov/cyberframework)

---

Last Updated: March 2026
