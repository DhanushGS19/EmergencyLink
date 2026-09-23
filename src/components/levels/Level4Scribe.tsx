import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';

export const Level4Scribe: React.FC = () => {
  const { unlockLevel } = useGameStore();
  const [phase, setPhase] = useState<'intro' | 'medium' | 'frantic' | 'broken'>('intro');
  const [score, setScore] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // A simple 2D drawing canvas overlay to simulate tracing Sanskrit strokes
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    // Escalate phases over time
    const t1 = setTimeout(() => setPhase('medium'), 5000);
    const t2 = setTimeout(() => setPhase('frantic'), 10000);
    const t3 = setTimeout(() => setPhase('broken'), 15000); // Tusk breaks
    const t4 = setTimeout(() => {
      unlockLevel(5);
      useGameStore.getState().setLevel(5);
    }, 20000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [unlockLevel]);

  const getPaceText = () => {
    switch (phase) {
      case 'intro': return "Vyasa speaks slowly...";
      case 'medium': return "Vyasa speaks faster...";
      case 'frantic': return "Vyasa's dictation is overwhelming!";
      case 'broken': return "The tusk breaks! But you do not stop.";
      default: return "";
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Simulate drawing
    ctx.lineWidth = phase === 'broken' ? 8 : 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = phase === 'broken' ? '#1e293b' : '#334155'; // Darker ink when broken
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    setScore(s => s + 1);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.beginPath();
  };

  return (
    <div className="w-full h-full relative bg-[#d9c5a0]">
      {/* Background 3D elements representing the hut */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <Canvas>
          <ambientLight intensity={1} />
          <Environment preset="sunset" />
          <mesh rotation={[0, Math.PI/4, 0]}>
             <torusGeometry args={[10, 3, 16, 100]} />
             <meshStandardMaterial color="#8b5a2b" />
          </mesh>
        </Canvas>
      </div>

      {/* Parchment Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
        <div className="text-center mb-8 z-10">
          <h2 className="text-3xl font-bold text-slate-800 tracking-widest">
            SCRIBE (THE MAHABHARATA)
          </h2>
          <p className="text-xl text-slate-700 font-serif mt-2 italic transition-all">
            {getPaceText()}
          </p>
        </div>

        <div className={`
          relative w-full max-w-4xl h-[60vh] bg-[#f5e6d3] rounded shadow-2xl border-2 border-[#c2a476]
          ${phase === 'frantic' ? 'animate-pulse' : ''}
          ${phase === 'broken' ? 'border-red-900 shadow-red-900/50' : ''}
        `}>
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className="w-full h-full cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
          
          {phase === 'broken' && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="text-6xl text-red-900/20 font-bold rotate-12">
                TUSK SHATTERED
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-slate-700 font-bold z-10">
          Verses Written: {Math.floor(score / 50)}
        </div>
      </div>
    </div>
  );
};
