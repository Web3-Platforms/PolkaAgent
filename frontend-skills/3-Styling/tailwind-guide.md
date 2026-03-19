# Tailwind CSS Fundamentals Guide

## Installation & Setup

### Next.js Integration (Recommended)

```bash
# Create Next.js with Tailwind
npx create-next-app@latest --typescript --tailwind

# Manual setup
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**tailwind.config.ts:**
```typescript
import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#EC4899',
      },
      spacing: {
        '128': '32rem',
      },
    },
  },
  plugins: [],
} satisfies Config
```

**globals.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Core Concepts

### 1. Utility Classes

```html
<!-- Display & Layout -->
<div class="flex items-center justify-between h-64 p-4">
  Content
</div>

<!-- Text -->
<p class="text-xl font-bold text-gray-900 leading-relaxed">
  Heading
</p>

<!-- Colors -->
<div class="bg-blue-500 text-white border-2 border-red-300">
  Styled box
</div>

<!-- Responsive Design -->
<div class="w-full md:w-1/2 lg:w-1/3 p-4 md:p-6 lg:p-8">
  Responsive padding and width
</div>

<!-- Hover & Interactive -->
<button class="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 
                  disabled:opacity-50 transition-colors">
  Button
</button>
```

### 2. Responsive Breakpoints

```typescript
// Tailwind breakpoints
const breakpoints = {
  'sm': '640px',   // Mobile
  'md': '768px',   // Tablet
  'lg': '1024px',  // Desktop
  'xl': '1280px',  // Large desktop
  '2xl': '1536px'  // Extra large
};
```

**Mobile-first approach:**
```html
<!-- Base: Mobile (400px)
     sm:   640px
     md:   768px
     lg:   1024px
-->

<div class="flex flex-col md:flex-row lg:grid lg:grid-cols-3">
  <div class="w-full md:w-1/2 lg:w-auto">
    Responsive layout
  </div>
</div>
```

### 3. Common Utilities

**Flexbox:**
```html
<!-- Flex container -->
<div class="flex flex-col md:flex-row gap-4">
  <!-- flex: display: flex
       flex-col: flex-direction: column
       gap-4: gap: 1rem
  -->
</div>

<!-- Align items -->
<div class="flex items-start">Start</div>
<div class="flex items-center">Center</div>
<div class="flex items-end">End</div>
<div class="flex items-stretch">Stretch</div>
```

**Grid:**
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div>Card 1</div>
  <div>Card 2</div>
  <div>Card 3</div>
</div>
```

**Spacing:**
```html
<!-- Margin (m, mt, mr, mb, ml, mx, my) -->
<div class="m-4 mt-8 mb-0">
  Margin: 1rem all sides, 2rem top
</div>

<!-- Padding (p, pt, pr, pb, pl, px, py) -->
<div class="p-4 pt-6 pb-2">
  Padding variations
</div>
```

**Typography:**
```html
<!-- Font sizes -->
<h1 class="text-4xl font-black">Extra Large</h1>
<h2 class="text-3xl font-bold">Large</h2>
<p class="text-base font-normal">Normal</p>
<small class="text-sm font-light">Small</small>

<!-- Font weights -->
<p class="font-thin">100</p>      <!-- Thin -->
<p class="font-normal">400</p>    <!-- Regular -->
<p class="font-bold">700</p>      <!-- Bold -->
<p class="font-black">900</p>     <!-- Extra bold -->

<!-- Text colors -->
<p class="text-gray-900">Dark text</p>
<p class="text-red-600">Error text</p>
<p class="text-blue-400">Link color</p>
```

## Component Creation

### 1. Button Component

```typescript
// components/Button.tsx
import { FC, ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseStyles = `
    font-medium rounded-lg transition-colors
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `.trim();

  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400'
  };

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return <button className={classes} {...props}>{children}</button>;
};

export default Button;
```

### 2. Card Component

```typescript
interface CardProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  hover?: boolean;
}

const Card: FC<CardProps> = ({ 
  title, 
  description, 
  children, 
  hover = false 
}) => {
  return (
    <div className={`
      bg-white rounded-lg p-6 border border-gray-200
      ${hover ? 'hover:shadow-lg transition-shadow' : 'shadow-md'}
    `}>
      {title && <h3 className="text-xl font-bold mb-2">{title}</h3>}
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      {children}
    </div>
  );
};
```

### 3. Form Input

```typescript
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input: FC<InputProps> = ({
  label,
  error,
  fullWidth = true,
  className = '',
  ...props
}) => {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
```

## Advanced Patterns

### 1. CSS-in-JS with Tailwind

```typescript
const containerClasses = `
  max-w-4xl mx-auto px-4 py-8
  md:px-6 md:py-12
  lg:px-8 lg:py-16
`;

const gridClasses = `
  grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
  gap-4 md:gap-6 lg:gap-8
`;
```

### 2. Conditional Classes

```typescript
function Badge({ status }: { status: 'success' | 'error' | 'warning' }) {
  const colorMap = {
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <span className={`
      inline-block px-3 py-1 rounded-full text-sm font-medium
      ${colorMap[status]}
    `}>
      {status}
    </span>
  );
}
```

### 3. @apply for Reusable Styles

**globals.css:**
```css
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded-lg
           hover:bg-blue-600 transition-colors;
  }

  .card {
    @apply bg-white rounded-lg shadow-md p-6
           border border-gray-200;
  }
}
```

Usage:
```html
<button class="btn-primary">Click me</button>
<div class="card">Content</div>
```

### 4. Dark Mode

**tailwind.config.ts:**
```typescript
export default {
  darkMode: 'class', // Use class strategy
  // ...
}
```

**Usage:**
```html
<html class="dark">
  <div class="bg-white dark:bg-gray-900 text-black dark:text-white">
    Toggles with dark class
  </div>
</html>
```

**Toggle function:**
```typescript
export function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
}
```

## Performance Optimization

```typescript
// tailwind.config.ts
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Only extend what you need
      colors: {
        brand: '#3B82F6',
      },
    },
  },
};
```

**CSS file size** - Only included classes are bundled:
- Development: Full Tailwind (~8MB)
- Production: Only used classes (~15-50KB gzipped)

## Common Mistakes

```html
<!-- ❌ Dynamic class names don't get purged -->
<div class="bg-${color}-500">Wrong</div>

<!-- ✅ Use conditional classes -->
<div class="bg-blue-500">Right</div>

<!-- ❌ Avoid inline styles -->
<div style={{ color: 'red' }}>Wrong</div>

<!-- ✅ Use Tailwind utilities -->
<div class="text-red-500">Right</div>
```

## Plugins & Extensions

```typescript
// tailwind.config.ts
import plugin from 'tailwindcss/plugin';

export default {
  plugins: [
    plugin(function({ addUtilities }) {
      addUtilities({
        '.text-shadow': {
          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      })
    })
  ],
};
```

## Resources

- [Tailwind CSS Official Docs](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/)
- [Headless UI](https://headlessui.com/) - Unstyled accessible components
- [DaisyUI](https://daisyui.com/) - Tailwind component library

---

Last Updated: March 2026
