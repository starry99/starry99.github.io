import p5 from 'p5';

export interface FrameData {
  x: number;
  y: number;
}

export interface AnimData {
  from: number;
  to: number;
  loop: boolean;
  speed: number;
}

export interface Character {
  spriteRef: p5.Image | null;
  anims: Record<string, number | AnimData>;
  currentAnim: string | null;
  currentFrame: number;
  currentFrameData: FrameData | null;
  animationTimer: number;
  previousTime: number;
  tileWidth: number;
  tileHeight: number;
  width: number;
  height: number;
  direction?: string;
  frames?: FrameData[];
  setAnim: (name: string) => void;
  setDirection: (direction: string) => void;
  setAnimFrame: (animData: number | AnimData) => FrameData;
}

export function makeCharacter(p: p5): Character {
  return {
    spriteRef: null,
    anims: {},
    currentAnim: null,
    currentFrame: 0,
    currentFrameData: null,
    animationTimer: 0,
    previousTime: 0,
    tileWidth: 32,
    tileHeight: 48,
    width: 32,
    height: 32,

    setAnim(name: string) {
      if (this.currentAnim !== name) {
        this.currentAnim = name;
        this.currentFrame = 0;
        this.animationTimer = 0;
        this.previousTime = 0;
      }
    },

    setDirection(direction: string) {
      if (this.direction !== direction) this.direction = direction;
    },

    setAnimFrame(animData: number | AnimData) {
      if (!this.frames) {
        throw new Error("Frames not initialized");
      }

      if (typeof animData === "number") {
        this.currentFrame = animData;
        return this.frames[this.currentFrame];
      }

      if (this.currentFrame === 0) {
        this.currentFrame = animData.from;
      }

      if (this.currentFrame > animData.to && animData.loop) {
        this.currentFrame = animData.from;
      }

      const currentFrameData = this.frames[this.currentFrame];

      const durationPerFrame = 1000 / animData.speed;
      if (this.animationTimer >= durationPerFrame) {
        this.currentFrame++;
        this.animationTimer -= durationPerFrame;
      }

      return currentFrameData;
    },
  };
}