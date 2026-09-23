import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useKeyboardControls, KeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { Physics, RigidBody, RapierRigidBody } from '@react-three/rapier';

const controls = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
];

const Player = ({ position }: { position: [number, number, number] }) => {
  const bodyRef = useRef<RapierRigidBody>(null);
  const [, get] = useKeyboardControls();
  const speed = 4;

  useFrame(() => {
    if (!bodyRef.current) return;
    const { forward, backward, left, right } = get();
    const velocity = bodyRef.current.linvel();
    const moveZ = (backward ? 1 : 0) - (forward ? 1 : 0);
    const moveX = (right ? 1 : 0) - (left ? 1 : 0);

    bodyRef.current.setLinvel({
      x: moveX * speed,
      y: velocity.y,
      z: moveZ * speed
    }, true);
  });

  return (
    <RigidBody ref={bodyRef} position={position} lockRotations colliders="hull">
      <mesh castShadow>
        <capsuleGeometry args={[0.5, 1, 4]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>
    </RigidBody>
  );
};

// Proximity Object that glows when the player is near (simulate memory/sound)
const ProximityObject = ({ position, color }: { position: [number, number, number], color: string }) => {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      {/* We use a basic material that stays slightly visible in the dark, simulating a memory/sound cue */}
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

export const Level3Curse: React.FC = () => {
  const [lightIntensity, setLightIntensity] = useState(1.5);
  const { unlockLevel } = useGameStore();
  const moonRef = useRef<THREE.DirectionalLight>(null);

  useFrame((state, delta) => {
    // Gradually decrease light intensity over time
    if (lightIntensity > 0.05) {
      setLightIntensity((prev) => Math.max(0.05, prev - delta * 0.05));
    }
    
    if (moonRef.current) {
      moonRef.current.intensity = lightIntensity;
    }
  });

  return (
    <div className="w-full h-full relative">
      <KeyboardControls map={controls}>
        <Canvas shadows camera={{ position: [0, 8, 15], fov: 60 }}>
          <color attach="background" args={['#020617']} />
          <ambientLight intensity={lightIntensity * 0.2} color="#1e293b" />
          
          <directionalLight 
            ref={moonRef}
            position={[10, 20, -10]} 
            intensity={1.5} 
            color="#e2e8f0" 
            castShadow 
          />

          <Physics gravity={[0, -20, 0]}>
            <Player position={[0, 2, 10]} />

            {/* Floor */}
            <RigidBody type="fixed" position={[0, -0.5, 0]}>
              <mesh receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#0f172a" rotation={[-Math.PI/2, 0, 0]} />
              </mesh>
            </RigidBody>

            {/* Village obstacles and paths */}
            <RigidBody type="fixed" position={[-5, 1, 0]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[4, 3, 4]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>
            </RigidBody>

            <RigidBody type="fixed" position={[5, 1, -5]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[4, 4, 6]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>
            </RigidBody>
            
            {/* Proximity Cues */}
            <ProximityObject position={[0, 0.5, -2]} color="#4ade80" />
            <ProximityObject position={[-4, 0.5, -8]} color="#facc15" />
            <ProximityObject position={[3, 0.5, -12]} color="#38bdf8" />
            
            {/* The Choice Area at the end */}
            <RigidBody type="fixed" position={[0, 0, -20]}>
              <mesh>
                <cylinderGeometry args={[3, 3, 0.2, 32]} />
                <meshStandardMaterial color="#94a3b8" emissive="#334155" />
              </mesh>
            </RigidBody>
          </Physics>

          <OrbitControls makeDefault maxPolarAngle={Math.PI / 2 - 0.1} minDistance={5} maxDistance={20} />
        </Canvas>
      </KeyboardControls>

      {/* UI Overlay */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none text-center">
        <h2 className="text-2xl font-bold text-slate-300 tracking-widest drop-shadow-md">
          CURSE (MOON'S MOCKERY)
        </h2>
        <p className="text-slate-500 mt-2 font-medium">
          Navigate using memory as the light fades.
        </p>
      </div>

      {/* Light Meter UI */}
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-4 h-48 bg-slate-800 rounded-full border border-slate-700 overflow-hidden">
        <div 
          className="absolute bottom-0 w-full bg-slate-200 transition-all" 
          style={{ height: `${(lightIntensity / 1.5) * 100}%` }}
        />
      </div>

      {/* Choice UI when reached end */}
      {lightIntensity <= 0.1 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center p-6 bg-slate-900/90 rounded border border-slate-700 shadow-2xl">
          <p className="text-white mb-4 italic text-lg">Chandra laughs in the darkness...</p>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                alert("You shattered the moon completely.");
                unlockLevel(4);
                useGameStore.getState().setLevel(4);
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded"
            >
              Full Curse (Darkness)
            </button>
            <button 
              onClick={() => {
                alert("You showed mercy. The moon will wax and wane.");
                unlockLevel(4);
                useGameStore.getState().setLevel(4);
              }}
              className="px-4 py-2 bg-slate-200 hover:bg-white text-slate-900 rounded shadow-[0_0_15px_rgba(255,255,255,0.5)]"
            >
              Mercy (Waxing/Waning)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
