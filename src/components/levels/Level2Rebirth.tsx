import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, useKeyboardControls, KeyboardControls } from '@react-three/drei';
import { Physics, RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

// Simple Keyboard controls setup
const controls = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'action', keys: ['KeyE'] }, // For grapple/climb interaction
];

const Player = () => {
  const bodyRef = useRef<RapierRigidBody>(null);
  const [, get] = useKeyboardControls();
  const { abilities } = useGameStore();
  const speed = 5;
  const jumpForce = 8;
  const [isGliding, setIsGliding] = useState(false);

  useFrame(() => {
    if (!bodyRef.current) return;
    
    const { forward, backward, left, right, jump, action } = get();
    const velocity = bodyRef.current.linvel();

    // Base Movement
    const moveZ = (backward ? 1 : 0) - (forward ? 1 : 0);
    const moveX = (right ? 1 : 0) - (left ? 1 : 0);

    bodyRef.current.setLinvel({
      x: moveX * speed,
      y: velocity.y,
      z: moveZ * speed
    }, true);

    // Jump
    // Simple ground check (assuming if y velocity is near 0)
    const isGrounded = Math.abs(velocity.y) < 0.1;
    if (jump && isGrounded) {
      bodyRef.current.setLinvel({ x: velocity.x, y: jumpForce, z: velocity.z }, true);
    }

    // Ear-Glide mechanic
    if (abilities.earGlide && jump && !isGrounded && velocity.y < 0) {
      // Slow down fall
      bodyRef.current.setLinvel({ x: velocity.x, y: -2, z: velocity.z }, true);
      setIsGliding(true);
    } else {
      setIsGliding(false);
    }

    // Tusk climb and Trunk swing logic would involve raycasting 
    // to specific objects, omitted here for prototype brevity, 
    // but the abilities boolean enables them.
  });

  return (
    <RigidBody ref={bodyRef} position={[0, 5, 0]} colliders="hull" lockRotations>
      <group>
        {/* Elephant body placeholder */}
        <mesh castShadow position={[0, 0, 0]}>
          <capsuleGeometry args={[0.5, 1, 4]} />
          <meshStandardMaterial color="#64748b" roughness={0.6} />
        </mesh>
        
        {/* Gliding visual (large ears) */}
        {isGliding && (
          <>
            <mesh position={[-0.8, 0.5, 0]} rotation={[0, 0, Math.PI / 8]}>
              <planeGeometry args={[1, 1]} />
              <meshStandardMaterial color="#94a3b8" side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0.8, 0.5, 0]} rotation={[0, 0, -Math.PI / 8]}>
              <planeGeometry args={[1, 1]} />
              <meshStandardMaterial color="#94a3b8" side={THREE.DoubleSide} />
            </mesh>
          </>
        )}
      </group>
    </RigidBody>
  );
};

// Platforms for the level
const LevelGeometry = () => {
  return (
    <group>
      {/* Floor */}
      <RigidBody type="fixed" position={[0, -0.5, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[50, 1, 50]} />
          <meshStandardMaterial color="#2d3748" />
        </mesh>
      </RigidBody>

      {/* A wall to climb (requires tuskClimb) */}
      <RigidBody type="fixed" position={[0, 5, -15]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[10, 10, 2]} />
          <meshStandardMaterial color="#4a5568" />
        </mesh>
      </RigidBody>

      {/* A gap requiring earGlide */}
      <RigidBody type="fixed" position={[0, 10, -25]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[10, 1, 10]} />
          <meshStandardMaterial color="#38a169" />
        </mesh>
      </RigidBody>
    </group>
  );
};

export const Level2Rebirth: React.FC = () => {
  const { abilities, unlockAbility, unlockLevel } = useGameStore();

  return (
    <div className="w-full h-full relative">
      <KeyboardControls map={controls}>
        <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
          {/* Golden hour lighting */}
          <color attach="background" args={['#d69e2e']} />
          <ambientLight intensity={0.4} color="#ffd700" />
          <directionalLight 
            position={[10, 10, 10]} 
            intensity={1.5} 
            color="#ffa500" 
            castShadow 
            shadow-bias={-0.0001}
          />
          
          <fog attach="fog" args={['#d69e2e', 10, 40]} />

          <Physics gravity={[0, -15, 0]}>
            <Player />
            <LevelGeometry />
          </Physics>

          <OrbitControls makeDefault maxPolarAngle={Math.PI / 2.1} minDistance={2} maxDistance={15} />
        </Canvas>
      </KeyboardControls>

      {/* UI Overlay */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none text-center">
        <h2 className="text-2xl font-bold text-slate-800 tracking-widest drop-shadow-md">
          REBIRTH (ELEPHANT FOREST)
        </h2>
        <p className="text-slate-700 mt-2 font-medium">
          Use WASD to move, Space to Jump.
        </p>
      </div>

      {/* Abilities Debug UI */}
      <div className="absolute bottom-10 left-10 p-4 bg-slate-900/80 rounded border border-slate-700">
        <h3 className="text-amber-500 font-bold mb-2">Abilities (Debug)</h3>
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => unlockAbility('trunkSwing')}
            className={`px-3 py-1 text-sm rounded ${abilities.trunkSwing ? 'bg-amber-600' : 'bg-slate-700'}`}
          >
            Trunk Swing (Grapple)
          </button>
          <button 
            onClick={() => unlockAbility('tuskClimb')}
            className={`px-3 py-1 text-sm rounded ${abilities.tuskClimb ? 'bg-amber-600' : 'bg-slate-700'}`}
          >
            Tusk Climb (Wall run)
          </button>
          <button 
            onClick={() => unlockAbility('earGlide')}
            className={`px-3 py-1 text-sm rounded ${abilities.earGlide ? 'bg-amber-600' : 'bg-slate-700'}`}
          >
            Ear Glide (Hold Jump)
          </button>
        </div>
      </div>
    </div>
  );
};
