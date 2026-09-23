import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Play, Lock } from 'lucide-react';

const levelNames = [
  "Prologue: Creation",
  "Guardian (Kailash Gate)",
  "Rebirth (Elephant Forest)",
  "Curse (Moon's Mockery)",
  "Scribe (Writing the Mahabharata)",
  "Mountain (Parashurama's Challenge)",
  "Race (Around the World)"
];

export const MainMenu: React.FC = () => {
  const { unlockedLevels, setLevel } = useGameStore();

  return (
    <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-slate-100 font-sans z-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-80" />
      
      <div className="z-10 text-center mb-12">
        <h1 className="text-6xl font-bold mb-4 tracking-wider text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
          EKADANTA
        </h1>
        <p className="text-xl text-slate-300 italic tracking-wide">
          The quiet remover of obstacles.
        </p>
      </div>

      <div className="z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl px-8">
        {[1, 2, 3, 4, 5, 6].map((lvl) => {
          const isUnlocked = unlockedLevels.includes(lvl as any);
          return (
            <button
              key={lvl}
              disabled={!isUnlocked}
              onClick={() => setLevel(lvl as any)}
              className={`
                relative group overflow-hidden rounded-xl p-6 text-left transition-all duration-300
                ${isUnlocked 
                  ? 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600 hover:border-amber-500/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/20 cursor-pointer' 
                  : 'bg-slate-900/50 border border-slate-800 opacity-60 cursor-not-allowed'}
              `}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold tracking-widest text-slate-400 uppercase">
                  Level {lvl}
                </span>
                {isUnlocked ? (
                  <Play className="w-5 h-5 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 duration-300" />
                ) : (
                  <Lock className="w-5 h-5 text-slate-600" />
                )}
              </div>
              <h3 className={`text-xl font-semibold ${isUnlocked ? 'text-slate-200' : 'text-slate-600'}`}>
                {levelNames[lvl]}
              </h3>
            </button>
          );
        })}
      </div>
      
      <div className="z-10 mt-16 text-slate-500 text-sm">
        Web Prototype - React Three Fiber
      </div>
    </div>
  );
};
