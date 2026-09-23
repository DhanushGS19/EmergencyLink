import React, { Suspense } from 'react';
import { useGameStore } from './store/useGameStore';
import { MainMenu } from './components/ui/MainMenu';
// Import levels lazily or directly. For now directly to avoid loading states issues in prototype
import { Level1Guardian } from './components/levels/Level1Guardian';
import { Level2Rebirth } from './components/levels/Level2Rebirth';
import { Level3Curse } from './components/levels/Level3Curse';
import { Level4Scribe } from './components/levels/Level4Scribe';
import { Level5Mountain } from './components/levels/Level5Mountain';
import { Level6Race } from './components/levels/Level6Race';

function App() {
  const { currentLevel, setLevel } = useGameStore();

  return (
    <div className="w-full h-screen relative bg-black text-white">
      {currentLevel === 0 && <MainMenu />}
      
      {currentLevel !== 0 && (
        <button 
          onClick={() => setLevel(0)}
          className="absolute top-4 left-4 z-50 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded border border-slate-600 transition-colors"
        >
          &larr; Back to Menu
        </button>
      )}

      {currentLevel === 1 && <Level1Guardian />}
      {currentLevel === 2 && <Level2Rebirth />}
      {currentLevel === 3 && <Level3Curse />}
      {currentLevel === 4 && <Level4Scribe />}
      {currentLevel === 5 && <Level5Mountain />}
      {currentLevel === 6 && <Level6Race />}
    </div>
  );
}

export default App;
