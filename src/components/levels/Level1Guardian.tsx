import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, useHelper } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

// The Intruder AI Logic
const Intruder = ({ decoyPosition, gameOver, win }: { decoyPosition: THREE.Vector3 | null, gameOver: () => void, win: () => void }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const speed = 2; // units per second
  const gatePosition = new THREE.Vector3(0, 1, -10);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Determine target: decoy or gate
    const target = decoyPosition ? decoyPosition : gatePosition;
    
    // Move towards target
    const direction = new THREE.Vector3().subVectors(target, meshRef.current.position).normalize();
    meshRef.current.position.addScaledVector(direction, speed * delta);
    
    // Check distance to gate
    if (meshRef.current.position.distanceTo(gatePosition) < 1.5 && !decoyPosition) {
      gameOver();
    }
    
    // Check if it reached the decoy
    if (decoyPosition && meshRef.current.position.distanceTo(decoyPosition) < 1.0) {
      // Intruder is distracted.
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 1, 10]} castShadow>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#881111" roughness={0.7} />
    </mesh>
  );
};

export const Level1Guardian: React.FC = () => {
  const [decoyPosition, setDecoyPosition] = useState<THREE.Vector3 | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'gameover' | 'won'>('playing');
  const { unlockLevel } = useGameStore();

  const handlePointerDown = (e: any) => {
    if (gameState !== 'playing') return;
    // Raycast hit point
    if (e.point) {
      setDecoyPosition(new THREE.Vector3(e.point.x, 0.5, e.point.z));
      
      // Decoy expires after 5 seconds
      setTimeout(() => {
        setDecoyPosition(null);
      }, 5000);
    }
  };

  useEffect(() => {
    // Win condition: survive for 20 seconds
    const timer = setTimeout(() => {
      if (gameState === 'playing') {
        setGameState('won');
        unlockLevel(2); // Unlock Level 2
      }
    }, 20000);
    return () => clearTimeout(timer);
  }, [gameState, unlockLevel]);

  return (
    <div className="w-full h-full relative">
      <Canvas shadows camera={{ position: [0, 8, 15], fov: 50 }}>
        <color attach="background" args={['#050811']} />
        
        {/* Night time lighting */}
        <ambientLight intensity={0.2} />
        <directionalLight 
          position={[-10, 20, -10]} 
          intensity={0.5} 
          color="#aabbee" 
          castShadow 
        />

        {/* The Environment / Floor */}
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, 0, 0]} 
          receiveShadow
          onPointerDown={handlePointerDown}
        >
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#1a202c" roughness={0.8} />
        </mesh>

        {/* The Gate to Kailash */}
        <mesh position={[0, 2.5, -10]} castShadow receiveShadow>
          <boxGeometry args={[8, 5, 1]} />
          <meshStandardMaterial color="#d4af37" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* The Intruder */}
        {gameState === 'playing' && (
          <Intruder 
            decoyPosition={decoyPosition} 
            gameOver={() => setGameState('gameover')}
            win={() => setGameState('won')}
          />
        )}

        {/* The Decoy */}
        {decoyPosition && (
          <mesh position={decoyPosition} castShadow>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2} />
            <pointLight color="#38bdf8" intensity={2} distance={10} />
          </mesh>
        )}

        <OrbitControls makeDefault maxPolarAngle={Math.PI / 2 - 0.1} minDistance={5} maxDistance={30} />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none text-center">
        <h2 className="text-2xl font-bold text-amber-500 tracking-widest drop-shadow-md">
          GUARDIAN OF KAILASH
        </h2>
        <p className="text-slate-300 mt-2">
          Click the ground to place illusions. Keep the intruder away from the golden gate!
        </p>
      </div>

      {/* End Game States */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center">
          <h2 className="text-5xl font-bold text-white mb-4">The Gate was Breached</h2>
          <button 
            onClick={() => {
              setGameState('playing');
              setDecoyPosition(null);
            }}
            className="px-6 py-3 bg-red-700 hover:bg-red-600 rounded text-xl"
          >
            Try Again
          </button>
        </div>
      )}

      {gameState === 'won' && (
        <div className="absolute inset-0 bg-green-900/80 flex flex-col items-center justify-center">
          <h2 className="text-5xl font-bold text-amber-500 mb-4 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]">
            Duty Fulfilled
          </h2>
          <p className="text-xl text-white mb-8">The intruder has given up. Level 2 Unlocked!</p>
          <button 
            onClick={() => useGameStore.getState().setLevel(2)}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-slate-900 font-bold rounded text-xl shadow-lg"
          >
            Continue Journey
          </button>
        </div>
      )}
    </div>
  );
};
