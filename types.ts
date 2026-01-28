
export interface VoxelData {
  id: string;
  x: number;
  y: number;
  z: number;
  color: string;
}

export interface VoxelState extends VoxelData {
  velocity: [number, number, number];
  isBroken: boolean;
  rotation: [number, number, number];
  angularVelocity: [number, number, number];
}

export enum AppStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  PLAYING = 'PLAYING',
  ERROR = 'ERROR'
}
