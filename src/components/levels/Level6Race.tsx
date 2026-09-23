import React, { useRef, useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useKeyboardControls, KeyboardControls } from '@react-three/drei';
import * as THREE from 'three';

const controls = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
];

const Player = ({ position, onMove }: { position: [number, number, number], onMove: (pos: THREE.Vector3) => void }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [, get] = useKeyboardControls();
  const speed = 10;

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const { forward, backward, left, right } = get();
    
    const moveZ = (backward ? 1 : 0) - (forward ? 1 : 0);
    const moveX = (right ? 1 : 0) - (left ? 1 : 0);

    meshRef.current.position.x += moveX * speed * delta;
    meshRef.current.position.z += moveZ * speed * delta;
    
    onMove(meshRef.current.position.clone());
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <capsuleGeometry args={[0.5, 1, 4]} />
      <meshStandardMaterial color="#475569" />
    </mesh>
  );
};

export const Level6Race: React.FC = () => {
  const [objective, setObjective] = useState<'race' | 'return' | 'finished'>('race');
  const [distance, setDistance] = useState(0);
  const [playerPos, setPlayerPos] = useState(new THREE.Vector3(0, 1, 0));
  
  const startPos = new THREE.Vector3(0, 1, 0);

  useEffect(() => {
    // If racing away, distance from start increases
    const dist = playerPos.distanceTo(startPos);
    setDistance(Math.floor(dist));
    
    if (objective === 'race' && dist > 50) {
      setObjective('return'); // Trigger the epiphany
    } else if (objective === 'return' && dist < 5) {
      setObjective('finished'); // Reached parents
    }
  }, [playerPos, objective]);

  return (
    <div className="w-full h-full relative">
      <KeyboardControls map={controls}>
        <Canvas shadows camera={{ position: [0, 15, 20], fov: 60 }}>
          <color attach="background" args={['#0f172a']} />
          <ambientLight intensity={0.5} />
          
          <directionalLight position={[10, 20, 10]} intensity={1} castShadow />

          {/* The Universe/World Track */}
          <mesh position={[0, -1, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
            <planeGeometry args={[500, 500]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>

          {/* Stars / Particles representation */}
          <points>
            <bufferGeometry>
              <bufferAttribute 
                attach="attributes-position" 
                count={1000} 
                array={new Float32Array(3000).map(() => (Math.random() - 0.5) * 400)} 
                itemSize={3} 
              />
            </bufferGeometry>
            <pointsMaterial size={1} color="#ffffff" />
          </points>

          {/* The Parents (Start/End Point) */}
          <mesh position={[0, 2, 0]} castShadow>
            <sphereGeometry args={[2, 32, 32]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
            <pointLight color="#fbbf24" intensity={2} distance={20} />
          </mesh>

          <Player position={[0, 1, 5]} onMove={setPlayerPos} />

          {/* Rival (Kartikeya) - always moving forward on the Z axis if racing */}
          {objective !== 'finished' && (
            <mesh position={[10, 1, -distance - 10]} castShadow>
               <boxGeometry args={[1, 2, 1]} />
               <meshStandardMaterial color="#38bdf8" />
            </mesh>
          )}

          <OrbitControls makeDefault maxPolarAngle={Math.PI / 2.1} />
        </Canvas>
      </KeyboardControls>

      {/* UI Overlay */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none text-center w-full">
        <h2 className="text-3xl font-bold text-slate-200 tracking-widest drop-shadow-md">
          RACE (AROUND THE WORLD)
        </h2>
        
        <div className="mt-8">
          {objective === 'race' && (
            <div className="animate-pulse text-amber-500 font-bold text-xl">
              RACE TO CIRCUMNAVIGATE THE WORLD!
              <br/>
              <span className="text-sm text-slate-400">Distance covered: {distance}m</span>
            </div>
          )}
          
          {objective === 'return' && (
            <div className="text-white text-xl p-4 bg-black/50 backdrop-blur rounded max-w-2xl mx-auto border border-slate-700">
              <p className="italic">"My parents are my universe."</p>
              <p className="text-amber-500 font-bold mt-2 animate-pulse">
                Return to the start.
              </p>
            </div>
          )}
          
          {objective === 'finished' && (
            <div className="text-white text-2xl p-8 bg-black/80 rounded max-w-2xl mx-auto border border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
              <h1 className="text-4xl text-amber-500 mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                The Universe Reached
              </h1>
              <p className="font-serif italic mb-8">
                While others run across the cosmos, you found the cosmos at home.
              </p>
              <button 
                onClick={() => useGameStore.getState().setLevel(0)}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded pointer-events-auto border border-slate-600"
              >
                Return to Title
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
