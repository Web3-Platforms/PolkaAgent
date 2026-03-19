# Frontend Performance Optimization Guide

## Core Web Vitals

### 1. Largest Contentful Paint (LCP) - < 2.5s

**What it measures:** Time until largest visual element paints

```typescript
// Measure LCP
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('LCP:', entry.renderTime || entry.loadTime);
  }
});

observer.observe({ entryTypes: ['largest-contentful-paint'] });
```

**Optimization strategies:**
```typescript
// 1. Preload critical images
<link rel="preload" as="image" href="/hero.jpg" media="(min-width: 768px)" />

// 2. Use priority images
import Image from 'next/image';

<Image
  src="/hero.jpg"
  priority // Critical for LCP
  width={1200}
  height={600}
/>

// 3. Avoid render-blocking resources
<script async src="/analytics.js"></script>

// 4. Use critical CSS
<style>{criticalCSS}</style>
<link rel="stylesheet" href="/non-critical.css" media="print" onload="this.media='all'" />
```

### 2. First Input Delay (FID) / Interaction to Next Paint (INP) - < 100ms

**What it measures:** Responsiveness to user input

```typescript
// Monitor INP
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('INP:', entry.duration);
  }
});

observer.observe({ entryTypes: ['event'] });
```

**Reduce JavaScript:**
```typescript
// ❌ Large bundle blocked input
<script src="/app-50mb.js"></script>

// ✅ Code split and lazy load
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### 3. Cumulative Layout Shift (CLS) - < 0.1

**What it measures:** Visual stability

```typescript
// Monitor CLS
let clsScore = 0;
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) {
      clsScore += entry.value;
      console.log('Current CLS:', clsScore);
    }
  }
});

observer.observe({ entryTypes: ['layout-shift'] });
```

**Prevent layout shifts:**
```typescript
// ❌ No placeholder = layout shift
function Image({ src }) {
  return <img src={src} />;
}

// ✅ Reserve space
import Image from 'next/image';

<Image
  src={src}
  width={800}
  height={600}
  placeholder="blur"
/>

// Or CSS aspect ratio
<div style={{ aspectRatio: '16/9' }}>
  <img src={src} style={{ width: '100%', height: '100%' }} />
</div>
```

## React Performance

### 1. Memoization - Prevent Unnecessary Renders

```typescript
import { memo, useMemo, useCallback } from 'react';

// Memoize component
interface ItemProps {
  id: string;
  name: string;
  onSelect: (id: string) => void;
}

const Item = memo<ItemProps>(({ id, name, onSelect }) => {
  console.log('Item rendered:', id);
  return (
    <button onClick={() => onSelect(id)}>
      {name}
    </button>
  );
}, (prevProps, nextProps) => {
  // Return true if props are equal (skip render)
  return prevProps.id === nextProps.id && 
         prevProps.name === nextProps.name;
});

// Stable callback reference
function List({ items, onItemSelect }) {
  const handleSelect = useCallback((id: string) => {
    onItemSelect(id);
  }, []); // Dependencies

  const memoItems = useMemo(() => {
    return items.map(item => (
      <Item key={item.id} {...item} onSelect={handleSelect} />
    ));
  }, [items, handleSelect]);

  return <div>{memoItems}</div>;
}
```

### 2. Code Splitting

```typescript
// Route-based splitting (automatic in Next.js)
import { lazy } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));

// Component-based splitting
const ModalContent = lazy(() => 
  import('./components/ModalContent').then(m => ({ 
    default: m.ModalContent 
  }))
);

// Dynamic import at runtime
async function loadPlugin(name: string) {
  const plugin = await import(`./plugins/${name}`);
  return plugin.default;
}
```

### 3. Virtualizing Lists

```typescript
// Use react-window for large lists
import { FixedSizeList } from 'react-window';

function LargeList({ items }: { items: Item[] }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].name}
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={35}
    >
      {Row}
    </FixedSizeList>
  );
}
```

## Asset Optimization

### 1. Image Optimization

```typescript
import Image from 'next/image';

function Hero() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero"
      width={1200}
      height={600}
      // Automatically optimized:
      // - Responsive sizes
      // - Modern formats (WebP)
      // - Different resolutions
      // - Lazy loading
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      priority // For LCP
      quality={80} // Compression
    />
  );
}
```

**WebP with fallback:**
```typescript
<picture>
  <source srcSet="/image.webp" type="image/webp" />
  <source srcSet="/image.jpg" type="image/jpeg" />
  <img src="/image.jpg" alt="Fallback" />
</picture>
```

### 2. CSS Optimization

```typescript
// Critical CSS inlined
export default function Layout({ children }) {
  return (
    <html>
      <head>
        <style>{`
          /* Critical above-the-fold styles */
          body { margin: 0; font-family: system-ui; }
          header { background: white; padding: 1rem; }
        `}</style>
        {/* Non-critical loaded async */}
        <link rel="stylesheet" href="/styles.css" media="print" 
              onLoad="this.media='all'" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 3. JavaScript Minification & Tree Shaking

```typescript
// next.config.ts
export default {
  swcMinify: true, // Faster than Terser
  productionBrowserSourceMaps: false, // Smaller builds
  
  webpack: (config) => {
    config.optimization.minimize = true;
    return config;
  }
};
```

## Monitoring Performance

### 1. Web Vitals Library

```bash
npm install web-vitals
```

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  console.log(metric);
  
  // Send to analytics service
  fetch('/api/metrics', {
    method: 'POST',
    body: JSON.stringify(metric)
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### 2. Performance Timeline

```typescript
// Measure component render time
function MeasuredComponent() {
  useEffect(() => {
    performance.mark('component-start');

    return () => {
      performance.mark('component-end');
      performance.measure(
        'component-duration',
        'component-start',
        'component-end'
      );
      
      const measure = performance.getEntriesByName('component-duration')[0];
      console.log('Render time:', measure.duration);
    };
  }, []);

  return <div>Content</div>;
}
```

## Production Optimization Checklist

```typescript
// next.config.ts
export default {
  compress: true,           // GZip compression
  minifyCSS: true,          // Minimize CSS
  minifyJS: true,           // Minimize JS
  optimizeFonts: true,      // Remove unused fonts
  productionBrowserSourceMaps: false, // Smaller builds
  
  images: {
    formats: ['image/avif', 'image/webp'], // Modern formats
    minimumCacheTTL: 31536000,            // Cache headers
  },

  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        }
      ]
    }
  ]
};
```

## Performance Anti-Patterns

```typescript
// ❌ Missing key prop causes re-renders
items.map((item, index) => <Item key={index} {...item} />)

// ✅ Use stable ID
items.map(item => <Item key={item.id} {...item} />)

// ❌ Creating objects in render
function MyComponent() {
  // Creates new object every render!
  const style = { color: 'red' };
  return <div style={style}>Text</div>;
}

// ✅ Memoize or move outside
const STYLE = { color: 'red' };

function MyComponent() {
  return <div style={STYLE}>Text</div>;
}

// ❌ useEffect without dependencies (infinite loop)
useEffect(() => {
  fetchData();
});

// ✅ Specify dependencies
useEffect(() => {
  fetchData();
}, [id]);
```

## Profiling Tools

```bash
# React DevTools Profiler
# Built-in Chrome DevTools

# Lighthouse
# In Chrome DevTools: Ctrl+Shift+J > Lighthouse

# WebPageTest
# https://www.webpagetest.org/

# Bundle analyzer
npm install -D @next.js/bundle-analyzer
```

## Resources

- [Web Vitals Guide](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/learn/seo/introduction-to-seo)
- [React DevTools Profiler](https://react.dev/learn/react-developer-tools)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

Last Updated: March 2026
