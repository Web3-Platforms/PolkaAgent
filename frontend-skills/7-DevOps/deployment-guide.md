# Deployment & DevOps Guide

## Build Optimization

### 1. Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'ES2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in prod
        drop_debugger: true
      }
    },
    sourcemap: false, // Exclude from production
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lodash', 'date-fns']
        }
      }
    }
  },
  define: {
    __API_URL__: JSON.stringify(process.env.VITE_API_URL)
  }
});
```

### 2. Webpack Configuration (if needed)

```typescript
// webpack.config.js
module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(),
      new CssMinimizerPlugin()
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.[tj]sx?$/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|gif)$/,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './src/index.html' }),
    new MiniCssExtractPlugin(),
  ],
};
```

## Docker Containerization

### 1. Multi-Stage Build

```dockerfile
# Dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Copy only built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN npm ci --production

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://backend:3001
    depends_on:
      - backend

  backend:
    image: backend-service
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/appdb
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## CI/CD Pipelines

### 1. GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Build & Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm run test

      - name: Build
        run: npm run build

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: vercel/action@v2
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### 2. GitLab CI/CD

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  NODE_VERSION: '18'

build:
  stage: build
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

test:
  stage: test
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm run test
    - npm run test:e2e
  dependencies:
    - build

deploy_production:
  stage: deploy
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm run deploy
  environment:
    name: production
    url: https://myapp.com
  only:
    - main
```

## Hosting Platforms

### 1. Vercel (Recommended for Next.js)

```bash
# install Vercel CLI
npm install -D vercel

# deploy
vercel deploy

# preview
vercel --prod
```

**vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": {
    "DATABASE_URL": "@database_url",
    "API_SECRET": "@api_secret"
  },
  "functions": {
    "api/**/*.js": {
      "maxDuration": 60
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "max-age=0" }
      ]
    }
  ],
  "redirects": [
    { "source": "/old", "destination": "/new", "permanent": true }
  ]
}
```

### 2. Netlify

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "https://api.example.com/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

### 3. AWS S3 + CloudFront

```bash
# Build and upload to S3
npm run build
aws s3 sync dist/ s3://my-bucket/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E123ABC \
  --paths "/*"
```

## Environment Management

```typescript
// .env.local (never commit)
NEXT_PUBLIC_API_URL=http://localhost:3001
DATABASE_URL=postgresql://localhost/dev_db
API_SECRET=dev_secret_key

// .env.production (commit only non-sensitive)
NEXT_PUBLIC_API_URL=https://api.example.com

// src/config.ts
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
};
```

## Monitoring & Logging

### 1. Error Tracking

```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

// Wrap React component
export const App = Sentry.withProfiler(AppComponent);

// Capture errors
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error);
}
```

### 2. Logs & Analytics

```typescript
// Logging service
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
    // Send to logging service
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error);
    // Send to error tracking
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  }
};

// Google Analytics
import { GoogleAnalytics } from '@next/third-parties/google';

export default function App() {
  return (
    <>
      <GoogleAnalytics gaId="G-XXXX" />
      {/* App */}
    </>
  );
}
```

## Production Checklist

```text
✓ Minified & optimized build
✓ Security headers configured
✓ HTTPS enabled
✓ Environment variables set
✓ Error tracking configured
✓ Monitoring & logging set up
✓ CDN/caching configured
✓ Rate limiting in place
✓ Database backups scheduled
✓ Health checks configured
✓ Auto-scaling configured
✓ Incident response plan ready
```

## Performance Monitoring

```typescript
// Collect metrics
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendMetric(metric) {
  fetch('/api/metrics', {
    method: 'POST',
    body: JSON.stringify(metric)
  });
}

getCLS(sendMetric);
getFID(sendMetric);
getFCP(sendMetric);
getLCP(sendMetric);
getTTFB(sendMetric);
```

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [AWS Deployment](https://aws.amazon.com/getting-started/hands-on/host-static-website/)
- [Netlify Documentation](https://docs.netlify.com/)

---

Last Updated: March 2026
