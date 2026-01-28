
import React, { useRef } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { VoxelState } from '../types';

// Augment the JSX namespace via the react module to include Three.js elements, resolving intrinsic element errors.
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface VoxelInstanceProps {
  data: VoxelState;
  onHit: (id: string) => void;
}

const VoxelInstance: React.FC<VoxelInstanceProps> = ({ data, onHit }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Local state for physics simulation when broken
  const physics = useRef({
    velocity: new THREE.Vector3(...data.velocity),
    angularVelocity: new THREE.Vector3(...data.angularVelocity),
    position: new THREE.Vector3(data.x - 6, data.y - 6, data.z - 6),
    rotation: new THREE.Euler(...data.rotation),
    isBroken: data.isBroken
  });

  // Keep physics state in sync with prop for breaking and resetting
  if (data.isBroken && !physics.current.isBroken) {
    physics.current.isBroken = true;
    
    // INTENSE BLAST: Significantly increased multipliers for "spilling" effect
    physics.current.velocity.set(
      (Math.random() - 0.5) * 40, // Increased horizontal spread
      Math.random() * 20 + 12,    // Increased vertical pop
      (Math.random() - 0.5) * 40  // Increased horizontal spread
    );
    
    physics.current.angularVelocity.set(
      (Math.random() - 0.5) * 25, // Increased spin speed
      (Math.random() - 0.5) * 25,
      (Math.random() - 0.5) * 25
    );
  } else if (!data.isBroken && physics.current.isBroken) {
    // Reset physics state when data.isBroken becomes false
    physics.current.isBroken = false;
    physics.current.position.set(data.x - 6, data.y - 6, data.z - 6);
    physics.current.velocity.set(0, 0, 0);
    physics.current.angularVelocity.set(0, 0, 0);
    physics.current.rotation.set(...data.rotation);
    
    // Manually update mesh position/rotation to match reset state
    if (meshRef.current) {
      meshRef.current.position.copy(physics.current.position);
      meshRef.current.rotation.copy(physics.current.rotation);
    }
  }

  useFrame((_state, delta) => {
    if (!meshRef.current || !physics.current.isBroken) return;

    // Gravity (Increased for snappier high-velocity physics)
    physics.current.velocity.y -= 25 * delta;

    // Apply velocity
    physics.current.position.addScaledVector(physics.current.velocity, delta);
    
    // Rotation
    physics.current.rotation.x += physics.current.angularVelocity.x * delta;
    physics.current.rotation.y += physics.current.angularVelocity.y * delta;
    physics.current.rotation.z += physics.current.angularVelocity.z * delta;

    // Floor collision
    if (physics.current.position.y < -10) {
      physics.current.position.y = -10;
      physics.current.velocity.y *= -0.6; // Higher bounce
      physics.current.velocity.x *= 0.92; // Lower friction
      physics.current.velocity.z *= 0.92;
      physics.current.angularVelocity.multiplyScalar(0.9); // Retain more spin on bounce
    }

    // Update mesh
    meshRef.current.position.copy(physics.current.position);
    meshRef.current.rotation.copy(physics.current.rotation);
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    onHit(data.id);
  };

  return (
    <mesh
      ref={meshRef}
      position={[data.x - 6, data.y - 6, data.z - 6]}
      rotation={data.rotation}
      onClick={handleClick}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      <boxGeometry args={[0.95, 0.95, 0.95]} />
      <meshStandardMaterial color={data.color} roughness={0.7} metalness={0.2} />
    </mesh>
  );
};

export default VoxelInstance;
