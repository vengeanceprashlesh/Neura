/**
 * Demo Templates - Simple, working examples
 * These render correctly in Sandpack without errors
 */

export const DEMO_APPS: Record<string, { name: string; files: Record<string, string> }> = {
    'todo': {
        name: 'Todo App',
        files: {
            'App.tsx': `import { useState } from 'react';

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Welcome to your Todo App', done: false },
    { id: 2, text: 'Click to mark as done', done: false },
    { id: 3, text: 'Add new tasks below', done: true },
  ]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input, done: false }]);
    setInput('');
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#111', padding: 40 }}>
      <h1 style={{ color: '#fff', fontSize: 32, marginBottom: 8 }}>My Tasks</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>Stay organized</p>
      
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && addTodo()}
          placeholder="Add a task..."
          style={{
            flex: 1,
            padding: '12px 16px',
            background: '#222',
            border: '1px solid #333',
            borderRadius: 8,
            color: '#fff',
            outline: 'none'
          }}
        />
        <button
          onClick={addTodo}
          style={{
            padding: '12px 24px',
            background: '#fff',
            border: 'none',
            borderRadius: 8,
            color: '#000',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          Add
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {todos.map(todo => (
          <div
            key={todo.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 16,
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: 8,
            }}
          >
            <button
              onClick={() => toggleTodo(todo.id)}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: todo.done ? 'none' : '2px solid #444',
                background: todo.done ? '#22c55e' : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              {todo.done && '✓'}
            </button>
            <span style={{ 
              flex: 1, 
              color: todo.done ? '#666' : '#fff',
              textDecoration: todo.done ? 'line-through' : 'none'
            }}>
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              style={{
                padding: '4px 8px',
                background: 'transparent',
                border: 'none',
                color: '#666',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}`,
            'styles.css': `body { margin: 0; font-family: system-ui, sans-serif; }`
        }
    },

    'portfolio': {
        name: 'Portfolio',
        files: {
            'App.tsx': `export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
      {/* Hero */}
      <div style={{ padding: '80px 40px', textAlign: 'center' }}>
        <div style={{ 
          width: 100, 
          height: 100, 
          borderRadius: '50%', 
          background: '#333',
          margin: '0 auto 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 40
        }}>
          👨‍💻
        </div>
        <h1 style={{ fontSize: 48, marginBottom: 8 }}>John Developer</h1>
        <p style={{ color: '#888', fontSize: 18 }}>Full-Stack Developer</p>
        
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
          <a href="#" style={{ 
            padding: '10px 20px', 
            background: '#fff', 
            color: '#000', 
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 500
          }}>
            Contact Me
          </a>
          <a href="#" style={{ 
            padding: '10px 20px', 
            background: '#222', 
            color: '#fff', 
            borderRadius: 8,
            textDecoration: 'none',
            border: '1px solid #333'
          }}>
            View Work
          </a>
        </div>
      </div>

      {/* Projects */}
      <div style={{ padding: '40px' }}>
        <h2 style={{ fontSize: 24, marginBottom: 24 }}>Projects</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {['E-Commerce', 'Mobile App', 'Dashboard'].map((name, i) => (
            <div key={i} style={{ 
              padding: 24, 
              background: '#111', 
              borderRadius: 12,
              border: '1px solid #222'
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>
                {['🛒', '📱', '📊'][i]}
              </div>
              <h3 style={{ marginBottom: 4 }}>{name}</h3>
              <p style={{ color: '#666', fontSize: 14 }}>Full-stack project</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: 40, textAlign: 'center', borderTop: '1px solid #222' }}>
        <p style={{ color: '#666' }}>© 2024 John Developer</p>
      </div>
    </div>
  );
}`,
            'styles.css': `body { margin: 0; font-family: system-ui, sans-serif; }`
        }
    },

    'dashboard': {
        name: 'Dashboard',
        files: {
            'App.tsx': `export default function App() {
  const stats = [
    { label: 'Revenue', value: '$45,231', change: '+20%' },
    { label: 'Users', value: '2,350', change: '+15%' },
    { label: 'Orders', value: '1,247', change: '+8%' },
    { label: 'Conversion', value: '12.5%', change: '+2%' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      {/* Sidebar */}
      <div style={{ width: 200, borderRight: '1px solid #222', padding: 20 }}>
        <h2 style={{ color: '#fff', fontSize: 18, marginBottom: 24 }}>Dashboard</h2>
        {['Overview', 'Analytics', 'Users', 'Settings'].map((item, i) => (
          <div key={i} style={{ 
            padding: '10px 12px', 
            borderRadius: 6,
            color: i === 0 ? '#fff' : '#666',
            background: i === 0 ? '#222' : 'transparent',
            marginBottom: 4,
            cursor: 'pointer'
          }}>
            {item}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 24 }}>
        <h1 style={{ color: '#fff', fontSize: 24, marginBottom: 24 }}>Overview</h1>
        
        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {stats.map((stat, i) => (
            <div key={i} style={{ 
              padding: 20, 
              background: '#111', 
              borderRadius: 12,
              border: '1px solid #222'
            }}>
              <p style={{ color: '#666', fontSize: 14, marginBottom: 4 }}>{stat.label}</p>
              <p style={{ color: '#fff', fontSize: 28, fontWeight: 600, marginBottom: 4 }}>{stat.value}</p>
              <p style={{ color: '#22c55e', fontSize: 14 }}>{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Chart Placeholder */}
        <div style={{ 
          padding: 24, 
          background: '#111', 
          borderRadius: 12,
          border: '1px solid #222'
        }}>
          <h3 style={{ color: '#fff', marginBottom: 16 }}>Revenue Chart</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 150 }}>
            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: h + '%',
                  background: 'linear-gradient(to top, #333, #444)',
                  borderRadius: '4px 4px 0 0'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}`,
            'styles.css': `body { margin: 0; font-family: system-ui, sans-serif; }`
        }
    }
};

/**
 * Get a demo app by type - fuzzy matching
 */
export function getDemoApp(type: string): { files: Record<string, string>; name: string } | null {
    const t = type.toLowerCase();

    if (t.includes('todo') || t.includes('task')) return DEMO_APPS['todo'];
    if (t.includes('portfolio') || t.includes('personal')) return DEMO_APPS['portfolio'];
    if (t.includes('dashboard') || t.includes('admin')) return DEMO_APPS['dashboard'];

    // Default
    return DEMO_APPS['todo'];
}

/**
 * Check if demo mode should be used
 */
export function shouldUseDemoMode(): boolean {
    const hasGroq = !!process.env.GROQ_API_KEY;
    const hasOpenRouter = !!process.env.OPENROUTER_API_KEY;
    const hasOpenAI = !!process.env.OPENAI_API_KEY;

    return !hasGroq && !hasOpenRouter && !hasOpenAI;
}
