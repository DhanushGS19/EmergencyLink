import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';

export const Level5Mountain: React.FC = () => {
  const { unlockLevel } = useGameStore();
  const [combatState, setCombatState] = useState<'idle' | 'incoming' | 'parried' | 'final_strike' | 'surrender'>('idle');
  const [strikesParried, setStrikesParried] = useState(0);

  useEffect(() => {
    if (combatState === 'idle' && strikesParried < 3) {
      const timer = setTimeout(() => {
        setCombatState('incoming');
        // Player has 1 second to parry
        setTimeout(() => {
          setCombatState(prev => (prev === 'incoming' ? 'idle' : prev));
        }, 1000);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (strikesParried >= 3 && combatState === 'idle') {
      setTimeout(() => setCombatState('final_strike'), 2000);
    }
  }, [combatState, strikesParried]);

  const handleParry = () => {
    if (combatState === 'incoming') {
      setCombatState('parried');
      setStrikesParried(s => s + 1);
      setTimeout(() => setCombatState('idle'), 1000);
    }
  };

  const handleSurrender = () => {
    if (combatState === 'final_strike') {
      setCombatState('surrender');
      setTimeout(() => {
        alert("Honor over defeat. Tusk lost, respect gained.");
        unlockLevel(6);
        useGameStore.getState().setLevel(6);
      }, 4000);
    }
  };

  return (
    <div className="w-full h-full relative">
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
        <color attach="background" args={['#475569']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, -5]} intensity={1} castShadow />
        <Environment preset="dawn" />
        
        {/* Mountain Environment */}
        <mesh position={[0, -1, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>

        {/* Player Placeholder */}
        <mesh position={[-2, 1, 0]} castShadow>
          <capsuleGeometry args={[0.5, 1, 4]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>

        {/* Parashurama Placeholder */}
        <mesh position={[2, 1, 0]} castShadow>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color="#b91c1c" />
          
          {/* Axe indicator */}
          {(combatState === 'incoming' || combatState === 'final_strike') && (
            <mesh position={[-1, 1, 0]}>
              <boxGeometry args={[1.5, 0.2, 0.2]} />
              <meshStandardMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={2} />
            </mesh>
          )}
        </mesh>

        <OrbitControls makeDefault maxPolarAngle={Math.PI / 2.1} />
      </Canvas>

      {/* Combat UI */}
      <div className="absolute inset-0 flex flex-col items-center p-12 pointer-events-none">
        <h2 className="text-3xl font-bold text-slate-200 tracking-widest drop-shadow-md">
          MOUNTAIN (PARASHURAMA'S CHALLENGE)
        </h2>
        
        <div className="mt-8 text-2xl font-bold">
          {combatState === 'idle' && <span className="text-slate-400">Parashurama watches...</span>}
          {combatState === 'incoming' && <span className="text-red-500 animate-pulse">Incoming Strike!</span>}
          {combatState === 'parried' && <span className="text-green-400">Parried!</span>}
          {combatState === 'final_strike' && <span className="text-amber-500">He raises Shiva's Axe for the final blow.</span>}
          {combatState === 'surrender' && <span className="text-blue-400 transition-opacity duration-1000">You lower your guard out of respect.</span>}
        </div>

        <div className="absolute bottom-20 flex gap-8 pointer-events-auto">
          {combatState !== 'final_strike' && combatState !== 'surrender' && (
            <button 
              onClick={handleParry}
              disabled={combatState !== 'incoming'}
              className={`px-8 py-4 text-xl font-bold rounded transition-all
                ${combatState === 'incoming' 
                  ? 'bg-slate-200 text-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.5)]' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
            >
              PARRY
            </button>
          )}

          {combatState === 'final_strike' && (
            <>
              <button 
                onClick={() => alert("You dodged Shiva's Axe. You survived, but at what cost?")}
                className="px-8 py-4 text-xl font-bold rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                DODGE
              </button>
              <button 
                onClick={handleSurrender}
                className="px-8 py-4 text-xl font-bold rounded bg-amber-900/80 hover:bg-amber-800 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all"
              >
                ACCEPT THE STRIKE
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
