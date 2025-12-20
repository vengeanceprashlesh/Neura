import { SandpackFiles } from './types';

// Default page code - works in both React SPA (Sandpack) and Next.js
export const DEFAULT_PAGE_CODE = `import { useState } from 'react';
import { Heart, Sparkles, Zap, Code2 } from 'lucide-react';

export default function App() {
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #18181b 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        background: 'rgba(39, 39, 42, 0.5)',
        backdropFilter: 'blur(20px)',
        borderRadius: '1.5rem',
        padding: '2rem',
        border: '1px solid rgba(63, 63, 70, 0.5)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxWidth: '400px',
        width: '100%',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            padding: '1rem',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '1rem',
          }}>
            <Code2 size={32} color="white" />
          </div>
        </div>
        
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '0.5rem',
          background: 'linear-gradient(90deg, #818cf8, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Neura App Builder
        </h1>
        
        <p style={{
          color: '#a1a1aa',
          textAlign: 'center',
          marginBottom: '2rem',
        }}>
          Describe your app idea and watch it come to life
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setCount(count + 1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              border: 'none',
              borderRadius: '0.75rem',
              color: 'white',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Zap size={18} />
            Count: {count}
          </button>

          <button
            onClick={() => setLiked(!liked)}
            style={{
              padding: '0.75rem',
              background: liked ? 'linear-gradient(135deg, #ec4899, #f43f5e)' : 'rgba(63, 63, 70, 0.5)',
              border: 'none',
              borderRadius: '0.75rem',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Heart size={20} fill={liked ? 'white' : 'none'} />
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          color: '#71717a',
          fontSize: '0.875rem',
        }}>
          <Sparkles size={14} />
          <span>Powered by AI</span>
        </div>
      </div>
    </div>
  );
}
`;

// Default CSS
export const DEFAULT_STYLES = `body {
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, sans-serif;
}

* {
  box-sizing: border-box;
}
`;

// Default files for Sandpack (React SPA structure for preview)
// When generating apps, we output Next.js App Router structure
export const DEFAULT_FILES: SandpackFiles = {
  '/App.tsx': {
    code: DEFAULT_PAGE_CODE,
    active: true,
  },
  '/styles.css': {
    code: DEFAULT_STYLES,
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

// Three.js Scene component (available as additional file)
export const THREE_SCENE_CODE = `import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Scene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(300, 300);
    containerRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x6366f1,
      metalness: 0.3,
      roughness: 0.4,
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    camera.position.z = 3;

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

  return <div ref={containerRef} style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }} />;
}
`;
