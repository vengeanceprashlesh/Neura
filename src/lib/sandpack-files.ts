import { SandpackFiles } from './types';

// Default App.tsx with demo component using pre-installed packages
export const DEFAULT_APP_CODE = `import { useState } from 'react';
import { Heart, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function App() {
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      color: '#e4e4e7',
      padding: '2rem',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1.5rem',
          padding: '2.5rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
          maxWidth: '400px',
        }}
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{ marginBottom: '1.5rem' }}
        >
          <Sparkles size={48} style={{ color: '#fbbf24' }} />
        </motion.div>
        
        <h1 style={{ 
          fontSize: '1.75rem', 
          fontWeight: 700,
          marginBottom: '0.5rem',
          background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Sandbox Demo
        </h1>
        
        <p style={{ 
          color: '#a1a1aa', 
          marginBottom: '2rem',
          fontSize: '0.95rem',
        }}>
          Edit this code to see live changes
        </p>

        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCount(count + 1)}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              border: 'none',
              borderRadius: '0.75rem',
              padding: '0.75rem 1.5rem',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Zap size={18} />
            Count: {count}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setLiked(!liked)}
            style={{
              background: liked 
                ? 'linear-gradient(135deg, #ec4899, #f43f5e)' 
                : 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '0.75rem',
              padding: '0.75rem',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            <Heart size={20} fill={liked ? 'white' : 'none'} />
          </motion.button>
        </div>

        <p style={{ 
          fontSize: '0.8rem', 
          color: '#71717a',
        }}>
          ✨ Powered by lucide-react & framer-motion
        </p>
      </motion.div>
    </div>
  );
}
`;

// Optional Scene.tsx for Three.js demos
export const DEFAULT_SCENE_CODE = `import { useEffect, useRef } from 'react';
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
      ref={containerRef} 
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '2rem',
      }} 
    />
  );
}
`;

// Default files for Sandpack
export const DEFAULT_FILES: SandpackFiles = {
    '/App.tsx': {
        code: DEFAULT_APP_CODE,
        active: true,
    },
    '/Scene.tsx': {
        code: DEFAULT_SCENE_CODE,
    },
};

// Custom dependencies for Sandpack
export const SANDPACK_DEPENDENCIES = {
    'lucide-react': 'latest',
    'framer-motion': 'latest',
    'three': 'latest',
    '@types/three': 'latest',
};
