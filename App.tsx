
import React, { useState, useCallback, useRef } from 'react';
import { generateVoxelsFromImage } from './services/geminiService';
import { VoxelState, AppStatus, VoxelData } from './types';
import VoxelScene from './components/VoxelScene';

const App: React.FC = () => {
  const [voxels, setVoxels] = useState<VoxelState[]>([]);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initVoxels = (data: VoxelData[]): VoxelState[] => {
    return data.map(v => ({
      ...v,
      velocity: [0, 0, 0],
      isBroken: false,
      rotation: [0, 0, 0],
      angularVelocity: [0, 0, 0]
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus(AppStatus.GENERATING);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        try {
          const voxelData = await generateVoxelsFromImage(base64);
          setVoxels(initVoxels(voxelData));
          setStatus(AppStatus.PLAYING);
        } catch (err) {
          setError("Failed to generate voxels. Please try again.");
          setStatus(AppStatus.ERROR);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Failed to read image file.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleVoxelHit = useCallback((id: string) => {
    setVoxels(prev => prev.map(v => 
      v.id === id ? { ...v, isBroken: true } : v
    ));
  }, []);

  const breakAll = () => {
    setVoxels(prev => prev.map(v => ({ ...v, isBroken: true })));
  };

  const reset = () => {
    setVoxels(prev => prev.map(v => ({ 
      ...v, 
      isBroken: false,
      velocity: [0, 0, 0],
      angularVelocity: [0, 0, 0]
    })));
  };

  const clear = () => {
    setVoxels([]);
    setStatus(AppStatus.IDLE);
  };

  return (
    <div className="relative w-full h-full">
      {/* 3D Scene */}
      {status === AppStatus.PLAYING && (
        <VoxelScene voxels={voxels} onVoxelHit={handleVoxelHit} />
      )}

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
        {/* Top Header */}
        <div className="flex justify-between items-start pointer-events-auto">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-2xl shadow-2xl">
            <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              VOXEL SMASH
            </h1>
            <p className="text-slate-400 text-xs">AI-Generated Destruction Toy</p>
          </div>

          {status === AppStatus.PLAYING && (
            <div className="flex gap-2">
              <button 
                onClick={breakAll}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg active:scale-95"
              >
                <i className="fa-solid fa-bomb mr-2"></i> SMASH ALL
              </button>
              <button 
                onClick={reset}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg active:scale-95"
              >
                <i className="fa-solid fa-rotate-left mr-2"></i> RESET
              </button>
              <button 
                onClick={clear}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg active:scale-95"
              >
                <i className="fa-solid fa-plus mr-2"></i> NEW
              </button>
            </div>
          )}
        </div>

        {/* Center UI (Initial / Loading) */}
        <div className="flex-1 flex items-center justify-center">
          {status === AppStatus.IDLE && (
            <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-10 rounded-[32px] shadow-2xl max-w-md w-full text-center">
              <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-cube text-4xl text-indigo-400"></i>
              </div>
              <h2 className="text-3xl font-bold mb-3">Create Voxel Art</h2>
              <p className="text-slate-400 mb-8">Upload an image and Gemini will turn it into a breakable 3D voxel sculpture.</p>
              
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden" 
                accept="image/*"
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98]"
              >
                <i className="fa-solid fa-upload mr-2"></i> Select Image
              </button>
            </div>
          )}

          {status === AppStatus.GENERATING && (
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-12 rounded-[32px] shadow-2xl text-center">
              <div className="relative w-20 h-20 mx-auto mb-8">
                <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-xl"></div>
                <div className="absolute inset-0 border-4 border-indigo-500 rounded-xl animate-[spin_3s_linear_infinite] border-t-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fa-solid fa-microchip text-2xl text-indigo-400 animate-pulse"></i>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Analyzing Image...</h2>
              <p className="text-slate-400">Gemini is carving your voxel masterpiece.</p>
            </div>
          )}

          {status === AppStatus.ERROR && (
            <div className="bg-slate-900/90 backdrop-blur-xl border border-red-900/30 p-10 rounded-[32px] shadow-2xl max-w-md w-full text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-circle-exclamation text-3xl text-red-500"></i>
              </div>
              <h2 className="text-2xl font-bold mb-2">Oops!</h2>
              <p className="text-slate-400 mb-8">{error}</p>
              <button 
                onClick={() => setStatus(AppStatus.IDLE)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-bold transition-all"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Bottom Instructions */}
        {status === AppStatus.PLAYING && (
          <div className="flex justify-center pointer-events-none mb-4">
            <div className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-white/70 text-sm flex gap-6">
              <span><i className="fa-solid fa-mouse mr-2"></i> Click a voxel to smash</span>
              <span><i className="fa-solid fa-arrows-up-down-left-right mr-2"></i> Drag to rotate</span>
              <span><i className="fa-solid fa-magnifying-glass mr-2"></i> Scroll to zoom</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
