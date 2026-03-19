# Next.js: Full-Stack React Framework Guide

## Overview

Next.js is a production-ready React framework enabling full-stack development with optimized performance, built-in routing, and server-side rendering.

## App Router Basics

### 1. File-Based Routing

```
app/
├── layout.tsx          # Root layout
├── page.tsx            # Home page /
├── dashboard/
│   ├── layout.tsx      # Dashboard layout
│   ├── page.tsx        # /dashboard
│   └── [id]/           # Dynamic route /dashboard/123
│       └── page.tsx
├── api/
│   └── users/
│       └── route.ts    # /api/users endpoint
└── (group)/            # Route group (doesn't add to URL)
    ├── page.tsx
    └── settings/
        └── page.tsx
```

### 2. Server Components (Default)

```javascript
// app/page.tsx - Server component by default
import { db } from '@/lib/db';

export default async function Home() {
  const posts = await db.post.findMany();

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  );
}
```

**Benefits:**
- Direct database access (no API routes needed)
- Secrets stay secure
- Reduced JavaScript sent to client
- Better performance

### 3. Client Components

```javascript
// app/dashboard/client.tsx
'use client'; // Mark as client component

import { useState, useEffect } from 'react';

export function ClientComponent() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Browser APIs available here
    console.log('Mounted');
  }, []);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
```

### 4. Data Fetching

**Server-side fetching:**
```javascript
// Recommended: Direct fetch in server components
export default async function Page() {
  const res = await fetch('https://api.example.com/data', {
    revalidate: 3600 // ISR - Revalidate every hour
  });
  const data = await res.json();

  return <div>{/* render data */}</div>;
}
```

**Dynamic rendering:**
```javascript
// Mark page as dynamic (not cached)
export const dynamic = 'force-dynamic';

// Or revalidate on demand
export const revalidate = 0; // Always fresh
```

### 5. Layouts & Templates

```javascript
// app/layout.tsx - Persistent layout
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <title>My App</title>
      </head>
      <body>
        <nav>Navigation</nav>
        {children}
      </body>
    </html>
  );
}

// app/dashboard/layout.tsx - Nested layout
export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <aside>Sidebar</aside>
      <main>{children}</main>
    </div>
  );
}
```

## API Routes

### 1. Route Handlers

```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ];

  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Validate and create
  const newUser = {
    id: Math.random(),
    ...body
  };

  return NextResponse.json(newUser, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({ deleted: true });
}
```

### 2. Dynamic API Routes

```typescript
// app/api/posts/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const post = await db.post.findUnique({
    where: { id: params.id }
  });

  if (!post) {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(post);
}
```

## Server Actions

Execute functions on server from client:

```typescript
// lib/actions.ts
'use server';

import { db } from '@/lib/db';

export async function createPost(formData: FormData) {
  const title = formData.get('title');
  const content = formData.get('content');

  try {
    const post = await db.post.create({
      data: { title, content }
    });

    return { success: true, post };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

**Client usage:**
```javascript
'use client';

import { createPost } from '@/lib/actions';

export function CreatePostForm() {
  const [error, setError] = useState('');

  async function handleSubmit(formData: FormData) {
    const result = await createPost(formData);

    if (!result.success) {
      setError(result.error);
    }
  }

  return (
    <form action={handleSubmit}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit">Create</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
```

## Middleware & Edge Functions

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Redirect based on header
  if (!request.headers.get('x-auth')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Continue
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*']
};
```

## Performance Features

### Image Optimization

```javascript
import Image from 'next/image';

export default function Hero() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero image"
      width={1200}
      height={600}
      priority // LCP optimization
      quality={80}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}
```

### Script Optimization

```javascript
import Script from 'next/script';

export default function Layout() {
  return (
    <>
      <Script
        src="https://analytics.example.com/script.js"
        strategy="lazyOnload" // Load after interactive
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
      >
        {`console.log('Analytics loaded')`}
      </Script>
    </>
  );
}
```

### CSS & Font Optimization

```javascript
import { Geist_Mono } from 'next/font/google';

const geist = Geist_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-geist' // CSS variable
});

export default function Layout({ children }) {
  return (
    <html className={geist.variable}>
      <body>{children}</body>
    </html>
  );
}
```

## Deployment & Production

### Environment Variables

```bash
# .env.local (never commit)
DATABASE_URL=postgresql://...
API_SECRET=secret123

# .env.production (secure values only)
NEXT_PUBLIC_API_URL=https://api.example.com
```

**Using variables:**
```javascript
const apiUrl = process.env.NEXT_PUBLIC_API_URL; // Client-side
const dbUrl = process.env.DATABASE_URL; // Server-only
```

### Deployment Checklist

```javascript
// next-seo.config.ts
export const defaultMeta = {
  titleTemplate: '%s | My App',
  description: 'My awesome app',
  canonical: 'https://myapp.com',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://myapp.com',
    images: [
      {
        url: 'https://myapp.com/og-image.jpg',
        width: 1200,
        height: 630
      }
    ]
  }
};
```

## Best Practices

1. **Prefer Server Components** - Use client only when needed
2. **Colocate Data Fetching** - Fetch near where it's used
3. **Use API Routes for External Services** - Keep secrets safe
4. **Optimize Images** - Use Next Image component
5. **Cache Strategically** - ISR, static generation where possible
6. **Security** - Validate all inputs, use CSP
7. **Testing** - Test API routes and server actions
8. **Monitoring** - Track Web Vitals, errors

## Common Patterns

**Protected Routes:**
```typescript
// middleware.ts
import { auth } from '@/auth';

export async function middleware(req: NextRequest) {
  const session = await auth();

  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}
```

**Streaming UI:**
```typescript
import { Suspense } from 'react';

async function Slow Component() {
  // Slow operation
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SlowComponent />
    </Suspense>
  );
}
```

## Resources

- [Next.js Official Docs](https://nextjs.org/docs)
- [Vercel Deployment](https://vercel.com/docs)
- [Next.js Examples](https://github.com/vercel/next.js/tree/canary/examples)

---

Last Updated: March 2026
