# React: Modern UI Library Guide

## Overview

React is a JavaScript library for building user interfaces with reusable components. React 19 introduces significant improvements in server components, actions, and performance.

## Core Concepts

### 1. Components & JSX

**Functional Components:**
```javascript
function Greeting({ name, age }) {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>You are {age} years old</p>
    </div>
  );
}

// Arrow function variant
const Welcome = ({ title }) => <h1>{title}</h1>;
```

**JSX Syntax Rules:**
- One root element per component
- Close all tags (self-closing for void elements)
- Use `className` instead of `class`
- Use `htmlFor` instead of `for`
- Expressions in `{}`
- Comments: `{/* comment */}`

### 2. Props & Destructuring

```javascript
// Passing props
<User name="Alice" age={30} isAdmin />

// Receiving props
function User({ name, age, isAdmin = false, children }) {
  return (
    <div>
      <h2>{name}</h2>
      <p>Age: {age}</p>
      {isAdmin && <span>Admin</span>}
      {children}
    </div>
  );
}

// Usage
<User name="Bob" age={25}>
  <p>Premium member</p>
</User>
```

### 3. Hooks: useState

```javascript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter name"
      />
    </div>
  );
}
```

**Best Practices:**
- One state for one concern
- Use functional updates for dependent state
- Initialize with useful default
- Keep state as local as possible

### 4. Hooks: useEffect

```javascript
import { useState, useEffect } from 'react';

function DataFetcher() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Cleanup flag

    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');
        const result = await response.json();
        
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency = runs once on mount

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return <div>{JSON.stringify(data)}</div>;
}
```

**Dependency Array Guide:**
- `[]` - Run once on mount
- `[value]` - Run when `value` changes
- No array - Run on every render (usually wrong!)

### 5. Hooks: Other Essential Hooks

**useReducer** - Complex state logic:
```javascript
const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, action.payload]
      };
    case 'REMOVE_TODO':
      return {
        ...state,
        todos: state.todos.filter(t => t.id !== action.payload)
      };
    default:
      return state;
  }
};

function App() {
  const [state, dispatch] = useReducer(reducer, {
    todos: []
  });

  return (
    <>
      <button onClick={() => dispatch({ 
        type: 'ADD_TODO', 
        payload: { id: 1, text: 'Learn React' } 
      })}>
        Add
      </button>
    </>
  );
}
```

**useContext** - Avoid prop drilling:
```javascript
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Use in component
function Button() {
  const { theme, setTheme } = useContext(ThemeContext);
  
  return (
    <button style={{ background: theme === 'dark' ? '#000' : '#fff' }}>
      Toggle: {theme}
    </button>
  );
}
```

**useMemo & useCallback** - Performance:
```javascript
function ExpensiveComponent({ data, onProcess }) {
  // Only recalculate when data changes
  const processed = useMemo(() => {
    return data.map(item => ({
      ...item,
      computed: heavyCalculation(item)
    }));
  }, [data]);

  // Maintain stable function reference
  const handleClick = useCallback(() => {
    onProcess(processed);
  }, [processed, onProcess]);

  return <button onClick={handleClick}>Process</button>;
}
```

## Component Composition Patterns

### 1. Compound Components

```javascript
// Parent controls internal state
const Tabs = ({ children, defaultTab }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return React.Children.map(children, child =>
    React.cloneElement(child, { activeTab, setActiveTab })
  );
};

const TabButton = ({ id, activeTab, setActiveTab, children }) => (
  <button
    onClick={() => setActiveTab(id)}
    style={{ fontWeight: activeTab === id ? 'bold' : 'normal' }}
  >
    {children}
  </button>
);

const TabPanel = ({ id, activeTab, children }) => (
  activeTab === id ? <div>{children}</div> : null
);

// Usage
<Tabs defaultTab="tab1">
  <TabButton id="tab1">Tab 1</TabButton>
  <TabButton id="tab2">Tab 2</TabButton>
  <TabPanel id="tab1">Content 1</TabPanel>
  <TabPanel id="tab2">Content 2</TabPanel>
</Tabs>
```

### 2. Render Props Pattern

```javascript
function DataProvider({ url, children }) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch(url).then(r => r.json()).then(setData);
  }, [url]);

  return children(data);
}

// Usage
<DataProvider url="/api/users">
  {users => (
    <div>
      {users?.map(user => (
        <p key={user.id}>{user.name}</p>
      ))}
    </div>
  )}
</DataProvider>
```

### 3. HOC (Higher-Order Component)

```javascript
function withTheme(Component) {
  return function ThemedComponent(props) {
    const [theme, setTheme] = useState('light');

    return (
      <Component 
        {...props} 
        theme={theme} 
        toggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
      />
    );
  };
}

// Usage
const ThemedButton = withTheme(Button);
```

## Common Patterns

### 1. Controlled Input

```javascript
function Form() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

### 2. Conditional Rendering

```javascript
function Alert({ type, message, onClose }) {
  // Early return
  if (!message) return null;

  const bgColor = type === 'error' ? 'red' : 'green';

  return (
    <div style={{ background: bgColor }}>
      {message}
      <button onClick={onClose}>X</button>
    </div>
  );
}

// Ternary (for simple cases)
{isLoading ? <Spinner /> : <Content />}

// Logical AND (show if true)
{isLoggedIn && <Dashboard />}

// Switch (multiple conditions)
{
  status === 'loading' ? <Spinner /> :
  status === 'error' ? <Error /> :
  <Success />
}
```

### 3. Lists & Keys

```javascript
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}> {/* Use stable ID, not index */}
          <input 
            type="checkbox" 
            checked={todo.done}
            onChange={() => handleToggle(todo.id)}
          />
          <span style={{ 
            textDecoration: todo.done ? 'line-through' : 'none'
          }}>
            {todo.text}
          </span>
        </li>
      ))}
    </ul>
  );
}
```

## Best Practices

1. **Component Naming** - PascalCase for components
2. **Props Interface** - Keep props flat and simple
3. **State Placement** - Move state up only when needed
4. **Keys** - Use stable, unique identifiers (not index!)
5. **Performance** - Profile before optimizing
6. **Error Boundaries** - Catch errors gracefully
7. **Accessibility** - Semantic HTML, ARIA labels
8. **Testing** - Test behavior, not implementation

## React 19 Features

**useActionState** - Server actions:
```javascript
const [state, formAction, isPending] = useActionState(
  async (prevState, formData) => {
    const result = await submitForm(formData);
    return result;
  },
  initialState
);

<form action={formAction}>
  <input type="text" name="email" />
  <button disabled={isPending}>
    {isPending ? 'Submitting...' : 'Submit'}
  </button>
</form>
```

**use()** - Unwrap promises:
```javascript
function Component({ pagePromise }) {
  const page = use(pagePromise);
  return <div>{page.title}</div>;
}
```

## Resources

- [React Official Docs](https://react.dev/)
- [React API Reference](https://react.dev/reference/react)
- [Beta React Docs](https://beta.react.dev/)
- [React Community](https://react.dev/community/)

---

Last Updated: March 2026
