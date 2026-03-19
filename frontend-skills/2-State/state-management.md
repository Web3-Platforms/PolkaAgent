# State Management Patterns Guide

## Built-in Solutions

### 1. useState - Simple State

```typescript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  // Update with new value
  const increment = () => setCount(count + 1);
  
  // Update with function (current state)
  const decrement = () => setCount(c => c - 1);
  
  // Multiple states
  const [name, setName] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}
```

**When to use:** Simple, local component state

### 2. useReducer - Complex State Logic

```typescript
type State = { count: number; step: number };
type Action = 
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'RESET' };

const initialState: State = { count: 0, step: 1 };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + state.step };
    case 'DECREMENT':
      return { ...state, count: state.count - state.step };
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <p>Count: {state.count}, Step: {state.step}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>
        +{state.step}
      </button>
      <button onClick={() => dispatch({ type: 'SET_STEP', payload: 5 })}>
        Increase step to 5
      </button>
    </div>
  );
}
```

**When to use:** Multiple related state values, complex update logic

### 3. useContext - Avoid Prop Drilling

```typescript
import { createContext, useContext, useState, ReactNode } from 'react';

interface Theme {
  isDark: boolean;
  toggle: () => void;
  colors: { primary: string; secondary: string };
}

const ThemeContext = createContext<Theme | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  const colors = isDark 
    ? { primary: '#000', secondary: '#333' }
    : { primary: '#fff', secondary: '#eee' };

  const theme: Theme = {
    isDark,
    toggle: () => setIsDark(!isDark),
    colors
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Usage in any component
function Button() {
  const { isDark, toggle, colors } = useTheme();
  
  return (
    <button 
      onClick={toggle}
      style={{ background: colors.primary }}
    >
      Toggle theme (currently {isDark ? 'dark' : 'light'})
    </button>
  );
}
```

## External State Management

### 1. Zustand - Lightweight Store

```typescript
// store.ts
import { create } from 'zustand';

interface Store {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useStore = create<Store>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 }))
}));

// Usage
function Counter() {
  const count = useStore((state) => state.count);
  const { increment, decrement } = useStore();

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}
```

**Devtools integration:**
```typescript
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export const useStore = create<Store>()(
  devtools(
    immer((set) => ({
      count: 0,
      increment: () => set((state) => { 
        state.count += 1; // Immer allows mutations
      })
    }))
  )
);
```

### 2. Redux - Enterprise Scale

```typescript
// store.ts
import { createSlice, configureStore } from '@reduxjs/toolkit';

interface CounterState {
  value: number;
}

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 } as CounterState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    }
  }
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;

export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**Usage in components:**
```typescript
import { useDispatch, useSelector } from 'react-redux';
import { increment, decrement } from './store';

function Counter() {
  const dispatch = useDispatch<AppDispatch>();
  const count = useSelector((state: RootState) => state.counter.value);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
    </div>
  );
}
```

### 3. TanStack Query - Server State

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetching data
function UsersList() {
  const { data: users, isPending, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      return response.json();
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// Mutations
function CreateUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newUser) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(newUser)
      });
      return response.json();
    },
    onSuccess: () => {
      // Revalidate the users list
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      mutation.mutate({ name: 'New User' });
    }}>
      <button disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

## Combining Patterns

### Context + useReducer

```typescript
interface AppContextType {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

// Usage
function MyComponent() {
  const { state, dispatch } = useApp();

  return (
    <button onClick={() => dispatch({ type: 'ACTION' })}>
      {state.data}
    </button>
  );
}
```

### Context + Query

```typescript
// Wrap QueryClientProvider with ThemeProvider
function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <Pages />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

## Decision Tree

```
Simple local state?
  → useState

Multiple values, complex logic?
  → useReducer

Deeply nested props?
  → useContext

Global app state?
  → Redux or Zustand

Server/fetched data?
  → TanStack Query

Real-time data?
  → WebSocket + store
```

## Best Practices

1. **Keep local, share globally** - useState for local, context/store for global
2. **Separate concerns** - Server state (Query) vs UI state (Redux/Zustand)
3. **Normalize state** - Avoid nested objects
4. **Use selectors** - Prevent unnecessary re-renders
5. **DevTools** - Use Redux DevTools or similar for debugging
6. **Testing** - Mock store in tests

## Anti-Patterns to Avoid

```typescript
// ❌ Storing derived state
const [todos, setTodos] = useState([]);
const [todoCount, setTodoCount] = useState(0); // Redundant!

// ✅ Derive during render
const todoCount = todos.length;

// ❌ Resetting unnecessary state
useEffect(() => {
  setData(null); // Causes re-render
}, [dependency]);

// ✅ Only update when needed
useEffect(() => {
  fetchData();
}, [dependency]);

// ❌ Multiple useState calls for related data
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [remember, setRemember] = useState(false);

// ✅ Group related state
const [form, setForm] = useState({ email: '', password: '', remember: false });
```

## Resources

- [React Context API](https://react.dev/reference/react/useContext)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [TanStack Query](https://tanstack.com/query/latest)

---

Last Updated: March 2026
