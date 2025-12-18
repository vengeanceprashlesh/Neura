import { SandpackFiles } from './types';

// Default Next.js App Router page
export const DEFAULT_PAGE_CODE = `'use client';

import { useState } from 'react';
import { Heart, Sparkles, Zap, Code2 } from 'lucide-react';

export default function Home() {
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex flex-col items-center justify-center p-8">
      <div className="bg-zinc-800/50 backdrop-blur-xl rounded-3xl p-8 border border-zinc-700/50 shadow-2xl max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl">
            <Code2 size={32} className="text-white" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-white mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Neura App Builder
        </h1>
        
        <p className="text-zinc-400 text-center mb-8">
          Describe your app idea and watch it come to life
        </p>

        <div className="flex gap-4 justify-center mb-6">
          <button
            onClick={() => setCount(count + 1)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105"
          >
            <Zap size={18} />
            Count: {count}
          </button>

          <button
            onClick={() => setLiked(!liked)}
            className={\`p-3 rounded-xl transition-all duration-200 transform hover:scale-110 \${
              liked 
                ? 'bg-gradient-to-r from-pink-500 to-rose-500' 
                : 'bg-zinc-700 hover:bg-zinc-600'
            }\`}
          >
            <Heart size={20} className="text-white" fill={liked ? 'white' : 'none'} />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-zinc-500 text-sm">
          <Sparkles size={14} />
          <span>Powered by AI</span>
        </div>
      </div>
    </div>
  );
}
`;

// Default Next.js App Router layout
export const DEFAULT_LAYOUT_CODE = `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Neura App',
  description: 'Built with Neura AI App Builder',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
`;

// Default globals.css with Tailwind
export const DEFAULT_GLOBALS_CSS = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 255, 255, 255;
  --background-rgb: 24, 24, 27;
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-rgb));
}
`;

// Default files for Sandpack (Next.js App Router structure)
export const DEFAULT_FILES: SandpackFiles = {
  '/app/page.tsx': {
    code: DEFAULT_PAGE_CODE,
    active: true,
  },
  '/app/layout.tsx': {
    code: DEFAULT_LAYOUT_CODE,
  },
  '/app/globals.css': {
    code: DEFAULT_GLOBALS_CSS,
  },
};

// Custom dependencies for Sandpack
export const SANDPACK_DEPENDENCIES = {
  'lucide-react': 'latest',
  'framer-motion': 'latest',
  'three': 'latest',
  '@types/three': 'latest',
  '@supabase/supabase-js': 'latest',
};
`;

// Optional Scene.tsx for Three.js demos (available as additional file)
export const THREE_SCENE_CODE = `'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Scene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(300, 300);
    containerRef.current.appendChild(renderer.domElement);

    // Create a cube
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      metalness: 0.3,
      roughness: 0.4,
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    camera.position.z = 3;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      containerRef.current?.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref= { containerRef }
  className = "flex justify-center items-center p-8"
    />
  );
}
`;
