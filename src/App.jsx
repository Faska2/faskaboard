import React, { useState, useEffect, useRef } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import CanvasBoard from './components/CanvasBoard';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import { useBoardStore } from './store/useBoardStore';
import { loadLastBoard } from './utils/localStorageManager';

function App() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const stageRef = useRef(null);
  const { setBoardState, canvasConfig } = useBoardStore();

  // Load last board automatically
  useEffect(() => {
    const lastBoard = loadLastBoard();
    if (lastBoard) {
      setBoardState(lastBoard);
      setIsEditorOpen(true);
    }
  }, [setBoardState]);

  // Handle dark mode class on body
  useEffect(() => {
    if (canvasConfig.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [canvasConfig.darkMode]);

  if (!isEditorOpen) {
    return <WelcomeScreen onStart={() => setIsEditorOpen(true)} />;
  }

  return (
    <div className={`relative h-screen overflow-hidden transition-colors duration-300 ${canvasConfig.darkMode ? 'dark bg-neutral-950' : 'bg-neutral-50'}`}>
      <CanvasBoard stageRef={stageRef} />

      {/* Overlay UI */}
      <Toolbar />
      <Sidebar stageRef={stageRef} />

      {/* Floating Logo/Title */}
      <div className="fixed top-6 left-6 flex items-center gap-2 pointer-events-none z-30 opacity-50 md:opacity-100 transition-opacity">
        <div className="w-8 h-8 md:w-10 md:h-10 bg-neutral-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-neutral-900 shadow-lg">
          <span className="font-bold text-sm md:text-base">F</span>
        </div>
        <h1 className="font-semibold text-neutral-900 dark:text-white hidden sm:block text-sm md:text-lg">FaskaBoard</h1>
      </div>

      {/* Back button */}
      <button
        onClick={() => setIsEditorOpen(false)}
        className="fixed top-6 left-1/2 -translate-x-1/2 md:top-auto md:bottom-6 md:left-6 md:translate-x-0 btn-secondary py-2 px-3 text-[10px] md:text-xs z-30 shadow-md"
      >
        Exit Editor
      </button>
    </div>
  );
}

export default App;
