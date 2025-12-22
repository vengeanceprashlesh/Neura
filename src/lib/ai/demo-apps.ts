/**
 * Demo Templates - Pre-built examples that work without API
 * 
 * These are shown when:
 * 1. No API key is configured
 * 2. User clicks "Try Demo" button
 * 3. API call fails
 */

export const DEMO_APPS: Record<string, { name: string; description: string; files: Record<string, string> }> = {
    'todo': {
        name: 'Todo App',
        description: 'A beautiful task management app with animations',
        files: {
            'App.tsx': `import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Trash2, Circle } from 'lucide-react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('todos');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input.trim(), completed: false }]);
    setInput('');
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-4 sm:p-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2"
          >
            My Tasks
          </motion.h1>
          <p className="text-zinc-400">Stay organized, stay productive</p>
        </div>

        {/* Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            placeholder="What needs to be done?"
            className="flex-1 px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addTodo}
            className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white font-medium hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-500/25"
          >
            <Plus size={20} />
          </motion.button>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mb-6"
        >
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={\`px-4 py-2 rounded-lg text-sm font-medium transition-all \${
                filter === f 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }\`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Todo List */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredTodos.map((todo) => (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                className={\`flex items-center gap-3 p-4 rounded-xl border transition-all \${
                  todo.completed 
                    ? 'bg-zinc-800/30 border-zinc-700/50' 
                    : 'bg-zinc-800/50 border-zinc-700'
                }\`}
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={\`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all \${
                    todo.completed 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-zinc-600 hover:border-indigo-500'
                  }\`}
                >
                  {todo.completed && <Check size={14} className="text-white" />}
                </button>
                <span className={\`flex-1 \${todo.completed ? 'text-zinc-500 line-through' : 'text-white'}\`}>
                  {todo.text}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => deleteTodo(todo.id)}
                  className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredTodos.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-zinc-500"
          >
            <Circle size={48} className="mx-auto mb-4 opacity-50" />
            <p>No tasks yet. Add one above!</p>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8 text-zinc-600 text-sm"
        >
          {todos.length > 0 && (
            <p>{todos.filter(t => !t.completed).length} tasks remaining</p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}`,
            'styles.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
}`
        }
    },

    'portfolio': {
        name: 'Portfolio',
        description: 'A stunning personal portfolio website',
        files: {
            'App.tsx': `import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, ExternalLink, Code, Palette, Zap } from 'lucide-react';

const skills = [
  { icon: Code, name: 'React & Next.js', color: 'from-blue-500 to-cyan-500' },
  { icon: Palette, name: 'UI/UX Design', color: 'from-purple-500 to-pink-500' },
  { icon: Zap, name: 'Performance', color: 'from-yellow-500 to-orange-500' },
];

const projects = [
  { name: 'E-Commerce Platform', description: 'Full-stack online store with Stripe', image: '🛒' },
  { name: 'AI Chat App', description: 'Real-time chat with OpenAI integration', image: '🤖' },
  { name: 'Analytics Dashboard', description: 'Data visualization with D3.js', image: '📊' },
];

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{ left: \`\${Math.random() * 100}%\`, top: \`\${Math.random() * 100}%\` }}
            />
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10 px-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-5xl"
          >
            👨‍💻
          </motion.div>
          <h1 className="text-5xl sm:text-7xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              John Developer
            </span>
          </h1>
          <p className="text-xl text-zinc-400 mb-8 max-w-lg mx-auto">
            Full-Stack Developer crafting beautiful, performant web experiences
          </p>
          <div className="flex gap-4 justify-center">
            {[Github, Linkedin, Mail].map((Icon, i) => (
              <motion.a
                key={i}
                whileHover={{ scale: 1.1, y: -2 }}
                className="p-3 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors"
              >
                <Icon size={24} />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Skills Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-center mb-12"
          >
            What I Do
          </motion.h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {skills.map((skill, i) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 text-center hover:border-zinc-700 transition-colors"
              >
                <div className={\`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br \${skill.color} flex items-center justify-center\`}>
                  <skill.icon size={28} />
                </div>
                <h3 className="font-semibold">{skill.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-20 px-6 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-center mb-12"
          >
            Featured Projects
          </motion.h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {projects.map((project, i) => (
              <motion.div
                key={project.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="group p-6 bg-zinc-800 rounded-2xl border border-zinc-700 hover:border-indigo-500/50 transition-all cursor-pointer"
              >
                <div className="text-5xl mb-4">{project.image}</div>
                <h3 className="font-semibold mb-2 group-hover:text-indigo-400 transition-colors">
                  {project.name}
                </h3>
                <p className="text-sm text-zinc-400">{project.description}</p>
                <ExternalLink size={16} className="mt-4 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-zinc-500 text-sm">
        <p>© 2024 John Developer. Built with ❤️ and React</p>
      </footer>
    </div>
  );
}`,
            'styles.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
}`
        }
    },

    'dashboard': {
        name: 'Dashboard',
        description: 'A modern admin dashboard with stats',
        files: {
            'App.tsx': `import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Users, ShoppingBag, DollarSign, 
  TrendingUp, Bell, Search, Menu, ChevronDown,
  BarChart3, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const stats = [
  { title: 'Total Revenue', value: '$45,231', change: '+20.1%', up: true, icon: DollarSign },
  { title: 'Active Users', value: '2,350', change: '+15.2%', up: true, icon: Users },
  { title: 'Total Orders', value: '1,247', change: '-4.5%', up: false, icon: ShoppingBag },
  { title: 'Conversion', value: '12.5%', change: '+2.4%', up: true, icon: TrendingUp },
];

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Users, label: 'Users', active: false },
  { icon: ShoppingBag, label: 'Products', active: false },
  { icon: BarChart3, label: 'Analytics', active: false },
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={\`\${sidebarOpen ? 'w-64' : 'w-20'} bg-zinc-900 border-r border-zinc-800 p-4 transition-all duration-300\`}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <LayoutDashboard size={20} />
          </div>
          {sidebarOpen && <span className="font-bold text-white">Neura Admin</span>}
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <motion.button
              key={item.label}
              whileHover={{ x: 4 }}
              className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors \${
                item.active 
                  ? 'bg-indigo-500/10 text-indigo-400' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }\`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </motion.button>
          ))}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Menu size={20} className="text-zinc-400" />
            </button>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors relative">
              <Bell size={20} className="text-zinc-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full" />
              <ChevronDown size={16} className="text-zinc-400" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-white mb-6"
          >
            Dashboard Overview
          </motion.h1>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-zinc-400 text-sm">{stat.title}</span>
                  <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center">
                    <stat.icon size={20} className="text-indigo-400" />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                  <div className={\`flex items-center gap-1 text-sm \${stat.up ? 'text-green-400' : 'text-red-400'}\`}>
                    {stat.up ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {stat.change}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Chart Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Revenue Over Time</h2>
            <div className="h-64 flex items-end justify-between gap-2">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((height, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: \`\${height}%\` }}
                  transition={{ delay: 0.5 + i * 0.05, duration: 0.5 }}
                  className="flex-1 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg"
                />
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs text-zinc-500">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}`,
            'styles.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
}`
        }
    }
};

/**
 * Get a demo app by type
 */
export function getDemoApp(type: string): { files: Record<string, string>; name: string } | null {
    // Fuzzy match
    const normalizedType = type.toLowerCase();

    if (normalizedType.includes('todo') || normalizedType.includes('task')) {
        return DEMO_APPS['todo'];
    }
    if (normalizedType.includes('portfolio') || normalizedType.includes('personal')) {
        return DEMO_APPS['portfolio'];
    }
    if (normalizedType.includes('dashboard') || normalizedType.includes('admin')) {
        return DEMO_APPS['dashboard'];
    }

    // Default to todo app
    return DEMO_APPS['todo'];
}

/**
 * Check if we should use demo mode
 */
export function shouldUseDemoMode(): boolean {
    const hasGroq = !!process.env.GROQ_API_KEY;
    const hasOpenRouter = !!process.env.OPENROUTER_API_KEY;
    const hasOpenAI = !!process.env.OPENAI_API_KEY;

    return !hasGroq && !hasOpenRouter && !hasOpenAI;
}
