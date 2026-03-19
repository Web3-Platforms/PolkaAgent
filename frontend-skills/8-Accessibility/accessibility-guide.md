# Frontend Accessibility (A11y) Guide

## Why Accessibility Matters

- **Legal**: Comply with WCAG 2.1, ADA, GDPR
- **Users**: ~15% population has disability
- **SEO**: Accessible sites rank better
- **Usability**: Better for everyone

## WCAG 2.1 Principles

- **P**erceivable - Content visible to all users
- **O**perable - Keyboard navigation, no time pressure
- **U**nderstandable - Clear language, consistent
- **R**obust - Works with assistive technology

## Semantic HTML

### 1. Meaningful Structure

```html
<!-- ❌ Non-semantic -->
<div onclick="navigate('/')">Home</div>
<div class="heading">Welcome</div>
<div class="list-item">Item 1</div>

<!-- ✅ Semantic -->
<a href="/">Home</a>
<h1>Welcome</h1>
<li>Item 1</li>
```

### 2. Correct Element Usage

```html
<!-- Buttons for actions -->
<button onclick="handleClick()">Click me</button>

<!-- Links for navigation -->
<a href="/about">About</a>

<!-- Form elements -->
<input type="text" aria-label="Search" />
<select>
  <option>Option 1</option>
</select>
<textarea></textarea>

<!-- Groups and containers -->
<nav>Navigation</nav>
<main>Main content</main>
<article>Article</article>
<section>Section</section>
<aside>Sidebar</aside>
<footer>Footer</footer>
```

## ARIA (Accessible Rich Internet Applications)

### 1. ARIA Attributes

```html
<!-- Labels for controls without visible text -->
<button aria-label="Close menu">×</button>

<!-- Describe complex elements -->
<div role="alert" aria-labelledby="error-title" aria-describedby="error-desc">
  <h2 id="error-title">Error</h2>
  <p id="error-desc">Username is required</p>
</div>

<!-- State indicators -->
<button aria-pressed="false" aria-label="Mute">🔊</button>

<!-- Live regions update info -->
<div aria-live="polite" aria-atomic="true">
  3 items added to cart
</div>

<!-- Expanded/collapsed state -->
<button aria-controls="menu" aria-expanded="false">
  Menu
</button>
<ul id="menu" hidden>
  <li><a href="/">Home</a></li>
</ul>
```

### 2. ARIA Roles

```html
<!-- Navigation -->
<nav role="navigation">
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>

<!-- Search -->
<form role="search">
  <input type="search" placeholder="Search..." />
  <button type="submit">Search</button>
</form>

<!-- Tabs -->
<div role="tablist">
  <button role="tab" aria-selected="true" aria-controls="panel-1">
    Tab 1
  </button>
  <div id="panel-1" role="tabpanel">Content 1</div>
</div>

<!-- Dialog -->
<div role="dialog" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Confirm action</h2>
  <p>Are you sure?</p>
  <button>Yes</button>
  <button>No</button>
</div>
```

## Keyboard Navigation

### 1. Focusable Elements

```html
<!-- Naturally focusable -->
<a href="/">Link</a>
<button>Button</button>
<input type="text" />
<select></select>
<textarea></textarea>

<!-- Make custom elements focusable -->
<div tabindex="0" role="button" onclick="handle()">
  Custom button
</div>

<!-- Remove from tab order -->
<button tabindex="-1">Not in tab order</button>

<!-- Skip link to main content -->
<a href="#main-content" class="skip-link">
  Skip to main content
</a>

<main id="main-content">
  Content
</main>
```

### 2. Focus Management

```typescript
// Focus management when opening modal
function Modal({ onClose }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Save currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus first element in modal
    const firstButton = dialogRef.current?.querySelector('button');
    firstButton?.focus();

    // Trap focus within modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }

      if (e.key === 'Tab') {
        // Implement focus trap logic
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);

      // Restore focus
      previousActiveElement.current?.focus();
    };
  }, [onClose]);

  return (
    <div ref={dialogRef} role="dialog" aria-labelledby="title">
      <h2 id="title">Confirmation</h2>
      <p>Confirm?</p>
      <button onClick={onClose}>Cancel</button>
      <button>Confirm</button>
    </div>
  );
}
```

## Color & Contrast

### 1. Color Contrast Ratios

```
Normal text:     4.5:1 (AA)
Large text (18+): 3:1 (AA)

Normal text:     7:1 (AAA)
Large text (18+): 4.5:1 (AAA)
```

```typescript
// Check contrast ratio
function Badge({ status }: { status: 'success' | 'error' }) {
  const colors = {
    success: {
      bg: '#00B87D',      // Contrast: 7.2:1 ✓
      text: '#FFFFFF'
    },
    error: {
      bg: '#FF4444',      // Contrast: 3.9:1 ✗ (too low)
      text: '#FFFFFF'
    }
  };

  return (
    <span style={{
      background: colors[status].bg,
      color: colors[status].text
    }}>
      {status}
    </span>
  );
}
```

### 2. Don't Rely on Color Alone

```html
<!-- ❌ Only uses color to indicate status -->
<div class="error">Error occurred</div>

<!-- ✅ Add icon and text -->
<div class="error">
  <span aria-hidden="true">⚠️</span>
  Error occurred
</div>

<!-- For color-blind users -->
<div style="border: 3px solid red; padding: 12px;">
  ❌ Invalid input
</div>
```

## Images & Icons

### 1. Alt Text

```html
<!-- Descriptive for content images -->
<img src="/user-chart.jpg" alt="Sales by region chart showing 40% North, 35% South, 25% West" />

<!-- Empty for decorative -->
<img src="/divider.png" alt="" />

<!-- Links need alt text -->
<a href="/profile">
  <img src="/avatar.jpg" alt="John's profile" />
</a>

<!-- Accessible SVG -->
<svg aria-labelledby="title">
  <title id="title">Company logo</title>
  <circle cx="50" cy="50" r="40" />
</svg>
```

### 2. Icon Conventions

```typescript
// Icon button with invisible label
<button aria-label="Close menu">
  <svg viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
</button>

// Icon with visible text
<button>
  <span aria-hidden="true">→</span>
  Next
</button>

// Decorative icon
<span aria-hidden="true">★</span>
```

## Forms & Labels

### 1. Proper Labeling

```html
<!-- Associated label -->
<label for="email">Email</label>
<input id="email" type="email" />

<!-- Grouped checkboxes -->
<fieldset>
  <legend>Choose options</legend>
  
  <label>
    <input type="checkbox" name="terms" />
    I agree to terms
  </label>
  
  <label>
    <input type="checkbox" name="newsletter" />
    Subscribe to newsletter
  </label>
</fieldset>

<!-- Clear error messages -->
<label for="password">Password</label>
<input id="password" type="password" aria-describedby="pwd-hint" />
<p id="pwd-hint">Must be 8+ characters</p>

<!-- Required indicator -->
<label for="name">
  Name
  <span aria-label="required">*</span>
</label>
<input id="name" type="text" required />
```

### 2. Form Validation

```typescript
function LoginForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    // Validate
    if (!email) newErrors.email = 'Email required';
    if (!password) newErrors.password = 'Password required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Submit
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          aria-describedby={errors.email ? 'email-error' : undefined}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p id="email-error" style={{ color: 'red' }}>
            {errors.email}
          </p>
        )}
      </div>

      <button type="submit">Login</button>
    </form>
  );
}
```

## Testing Accessibility

### 1. Automated Testing

```bash
npm install -D jest-axe
npm install -D @axe-core/react
```

```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should not have accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 2. Manual Testing

```typescript
// Test with keyboard only
// 1. Tab through all interactive elements
// 2. Enter/Space to activate buttons
// 3. Arrow keys for menus/tabs
// 4. Escape to close dialogs

// Screen reader testing
// - NVDA (Windows)
// - JAWS (Windows)
// - VoiceOver (macOS/iOS)
// - TalkBack (Android)

// Browser extension
// - axe DevTools
// - Wave
// - Lighthouse Accessibility Audit
```

## Accessibility Checklist

- [ ] Semantic HTML used
- [ ] All images have alt text
- [ ] Form labels associated with inputs
- [ ] Color contrast ≥ 4.5:1 (AA)
- [ ] Keyboard navigation works
- [ ] Focus visible
- [ ] ARIA used correctly
- [ ] No automatic audio/video
- [ ] Videos have captions
- [ ] Links have descriptive text
- [ ] No content by color alone
- [ ] Tested with screen reader
- [ ] Runs axe DevTools with no violations

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)
- [MDN ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)

---

Last Updated: March 2026
