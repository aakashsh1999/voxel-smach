
import React from 'react';
import { Canvas, ThreeElements } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars, ContactShadows } from '@react-three/drei';
import VoxelInstance from './VoxelInstance';
import { VoxelState } from '../types';

// Augment the JSX namespace via the react module to include Three.js elements, resolving intrinsic element errors.
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface VoxelSceneProps {
  voxels: VoxelState[];
  onVoxelHit: (id: string) => void;
}

const VoxelScene: React.FC<VoxelSceneProps> = ({ voxels, onVoxelHit }) => {
  return (
    <div className="w-full h-full bg-slate-950">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[15, 15, 15]} fov={45} />
        <OrbitControls enableDamping minDistance={5} maxDistance={50} />
        
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 20, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4f46e5" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <group position={[0, 0, 0]}>
          {voxels.map((v) => (
            <VoxelInstance key={v.id} data={v} onHit={onVoxelHit} />
          ))}
        </group>

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -10.5, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#0f172a" transparent opacity={0.5} />
        </mesh>

        <ContactShadows 
          position={[0, -10.4, 0]} 
          opacity={0.4} 
          scale={40} 
          blur={2} 
          far={10} 
          resolution={256} 
          color="#000000" 
        />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

export default VoxelScene;
