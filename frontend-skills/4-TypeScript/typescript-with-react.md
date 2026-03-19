# TypeScript with React Guide

## Core TypeScript Concepts

### 1. Types & Interfaces

```typescript
// Basic types
let name: string = 'Alice';
let age: number = 30;
let isActive: boolean = true;
let items: string[] = ['a', 'b'];
let anything: any = 'could be anything'; // Avoid!
let unknown_val: unknown = 'safer than any'; // Safer

// Union types
type Status = 'idle' | 'loading' | 'done' | 'error';
let status: Status = 'loading'; // Only these values

// Type aliases
type User = {
  id: number;
  name: string;
  email: string;
  isAdmin?: boolean; // Optional
};

// Interfaces (prefer for objects)
interface Product {
  id: string;
  title: string;
  price: number;
  description?: string;
}

// Extending interfaces
interface PremiumProduct extends Product {
  warranty: number;
}
```

### 2. Functions

```typescript
// Basic function typing
function add(a: number, b: number): number {
  return a + b;
}

// Arrow functions
const multiply = (x: number, y: number): number => x * y;

// Optional & default parameters
function greet(name: string, age?: number): string {
  return `Hello ${name}${age ? ` (${age})` : ''}`;
}

function setConfig(timeout: number = 5000): void {
  console.log(`Timeout: ${timeout}`);
}

// Rest parameters
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

// Overloading
function format(value: string): string;
function format(value: number): string;
function format(value: string | number): string {
  return String(value);
}

// Generic functions
function getFirstItem<T>(items: T[]): T | undefined {
  return items[0];
}

const first = getFirstItem(['a', 'b']); // string
const num = getFirstItem([1, 2]);       // number
```

### 3. Generics

```typescript
// Generic type
type Response<T> = {
  data: T;
  status: number;
  error?: string;
};

const userResponse: Response<User> = {
  data: { id: 1, name: 'Alice', email: 'alice@example.com' },
  status: 200
};

// Generic constraints
function merge<T extends object, U extends object>(
  obj1: T,
  obj2: U
): T & U {
  return { ...obj1, ...obj2 };
}

// Generic with defaults
type List<T = string> = {
  items: T[];
  size: number;
};

const strings: List = { items: ['a'], size: 1 };
const numbers: List<number> = { items: [1], size: 1 };
```

## React Component Types

### 1. Functional Component

```typescript
import React, { FC } from 'react';

interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

// Explicit type
const Button: FC<ButtonProps> = ({
  onClick,
  disabled = false,
  children,
  variant = 'primary'
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
};

export default Button;
```

### 2. Event Handling

```typescript
function Form() {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Submitted');
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log(e.button); // 0 = left, 1 = middle, 2 = right
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} />
      <button onClick={handleClick}>Submit</button>
    </form>
  );
}
```

### 3. Hooks with TypeScript

```typescript
import { useState, useCallback, useMemo, useRef } from 'react';

// useState with type inference
const [count, setCount] = useState(0);        // number
const [name, setName] = useState('');         // string
const [items, setItems] = useState<string[]>([]); // Explicit

// useCallback
const handleClick = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
  (e) => {
    console.log(e.currentTarget);
  },
  []
);

// useMemo
const computed = useMemo<number>(() => {
  return expensiveCalculation();
}, []);

// useRef
const inputRef = useRef<HTMLInputElement>(null);
const click = () => {
  inputRef.current?.focus();
};
```

### 4. useReducer

```typescript
interface AppState {
  count: number;
  loading: boolean;
  error?: string;
}

type Action =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string };

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'DECREMENT':
      return { ...state, count: state.count - 1 };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      const _: never = action; // Exhaustiveness check
      return state;
  }
};
```

### 5. Context API

```typescript
import { createContext, useContext, FC, ReactNode } from 'react';

interface AuthContext {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthCtx = createContext<AuthContext | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // Login logic
  };

  const logout = () => setUser(null);

  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
};

// Custom hook
export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
```

## Utility Types

```typescript
// Partial - All properties optional
type PartialUser = Partial<User>;

// Required - All properties required
type FullUser = Required<User>;

// Readonly - Properties cannot change
type ReadonlyUser = Readonly<User>;

// Pick - Select specific properties
type PreviewUser = Pick<User, 'id' | 'name'>;

// Omit - Exclude specific properties
type UserWithoutEmail = Omit<User, 'email'>;

// Record - Create object with specific keys
type UserRoles = Record<'admin' | 'user' | 'guest', string>;
// { admin: string; user: string; guest: string; }

// ReturnType - Get return type of function
type AddResult = ReturnType<typeof add>; // number

// Parameters - Get parameter types
type AddParams = Parameters<typeof add>; // [number, number]

// Exclude - Remove types from union
type NonNull<T> = Exclude<T, null | undefined>;
```

## Common Patterns

### 1. Forward Refs

```typescript
import { forwardRef } from 'react';

interface InputProps {
  placeholder: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ placeholder }, ref) => (
    <input ref={ref} placeholder={placeholder} />
  )
);

Input.displayName = 'Input';

export default Input;
```

### 2. HOC (Higher-Order Component)

```typescript
import { ComponentType } from 'react';

function withAuth<P extends object>(
  Component: ComponentType<P>
) {
  return function Wrapped(props: P) {
    const { user } = useAuth();

    if (!user) return <p>Not authenticated</p>;

    return <Component {...props} />;
  };
}
```

### 3. Component Props

```typescript
// Get component props type
type ButtonProps = React.ComponentProps<'button'>;

// Extend with custom props
interface MyButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary';
}

// Get children type
interface ContainerProps {
  children: React.ReactNode; // Accepts any valid React content
}

// Render props pattern
interface RenderPropProps {
  render: (data: Data) => React.ReactNode;
}
```

## API Typing

```typescript
// Type API responses
interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}

// Error handling
async function safeApi<T>(
  fn: () => Promise<T>
): Promise<{ data?: T; error?: string }> {
  try {
    const data = await fn();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown' };
  }
}
```

## Best Practices

1. **Prefer Interfaces for Objects** - More concise
2. **Use Union Types for Variants** - Better than booleans
3. **Avoid `any`** - Use `unknown` or specific types
4. **Enable Strict Mode** - `"strict": true` in tsconfig
5. **Index Signatures Carefully** - Can hide errors
6. **Document Complex Types** - Use JSDoc comments
7. **Test Type Definitions** - Ensure they work as expected

## Common Mistakes

```typescript
// ❌ Too broad
type Data = any;

// ✅ Specific
type Data = { id: string; name: string };

// ❌ Redundant
const value: number = 42;

// ✅ Use inference
const value = 42;

// ❌ Unsafe as const
const status = 'loading'; // type: string

// ✅ Correct
const status = 'loading' as const; // type: 'loading'
```

## Resources

- [TypeScript Official Docs](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Playground](https://www.typescriptlang.org/play)

---

Last Updated: March 2026
