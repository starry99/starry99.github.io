import p5 from 'p5';
import { makeCharacter, Character } from "./character";

import { drawTile, getFramesPos, isMaxOneKeyDown } from "../utils";
import { Camera } from "./camera";

export interface Player extends Character {
  speed: number;
  x: number;
  y: number;
  screenX: number;
  screenY: number;
  spriteX: number;
  spriteY: number;
  freeze: boolean;
  load: () => void;
  prepareAnims: () => void;
  movePlayer: (moveBy: number) => void;
  setup: () => void;
  update: () => void;
  draw: (camera: Camera) => void;
  setGender: (gender: 'male' | 'female') => void;
}

export function makePlayer(p: p5, x: number, y: number): Player {
  let spriteMale: p5.Image;
  let spriteFemale: p5.Image;

  return {
    ...makeCharacter(p),
    speed: 200,
    x,
    y,
    screenX: x,
    screenY: y,
    spriteX: 0,
    spriteY: -15,
    freeze: false,
    spriteRef: null,
    load() {
      spriteFemale = p.loadImage("/assets/jessie.png");
      spriteMale = p.loadImage("/assets/james.png");
      this.spriteRef = spriteFemale;
    },
    setGender(gender: 'male' | 'female') {
      if (gender === 'male') {
        this.spriteRef = spriteMale;
      } else {
        this.spriteRef = spriteFemale;
      }
    },

    prepareAnims() {
      this.frames = getFramesPos(4, 4, this.tileWidth, this.tileHeight);

      this.anims = {
        "idle-down": 0,
        "idle-side": 6,
        "idle-up": 12,
        "run-down": { from: 0, to: 3, loop: true, speed: 8 },
        "run-side": { from: 4, to: 7, loop: true, speed: 8 },
        "run-up": { from: 12, to: 15, loop: true, speed: 8 },
      };
    },

    movePlayer(moveBy: number) {
      if (!isMaxOneKeyDown(p) || this.freeze) return;

      if (p.keyIsDown(p.RIGHT_ARROW) || p.keyIsDown(68)) {
        this.setDirection("right");
        this.setAnim("run-side");
        this.x += moveBy;
      }

      if (p.keyIsDown(p.LEFT_ARROW) || p.keyIsDown(65)) {
        this.setDirection("left");
        this.setAnim("run-side");
        this.x -= moveBy;
      }

      if (p.keyIsDown(p.UP_ARROW) || p.keyIsDown(87)) {
        this.setDirection("up");
        this.setAnim("run-up");
        this.y -= moveBy;
      }

      if (p.keyIsDown(p.DOWN_ARROW) || p.keyIsDown(83)) {
        this.setDirection("down");
        this.setAnim("run-down");
        this.y += moveBy;
      }
    },

    setup() {
      this.prepareAnims();
      this.direction = "down";
      this.setAnim("idle-down");
    },

    update() {
      this.previousTime = this.animationTimer;
      this.animationTimer += p.deltaTime;

      const moveBy = (this.speed / 1000) * p.deltaTime;
      this.movePlayer(moveBy);

      if (this.currentAnim) {
        const animData = this.anims[this.currentAnim];
        this.currentFrameData = this.setAnimFrame(animData);
      }
    },

    draw(camera: Camera) {
      this.screenX = this.x + camera.x;
      this.screenY = this.y + camera.y;

      p.push();
      if (this.direction === "right") {
        p.scale(-1, 1);
        p.translate(-2 * this.screenX - this.tileWidth, 0);
      }

      
      if (this.spriteRef && this.currentFrameData) {
        drawTile(
            p,
            this.spriteRef,
            this.screenX + this.spriteX,
            this.screenY + this.spriteY,
            this.currentFrameData.x,
            this.currentFrameData.y,
            this.tileWidth,
            this.tileHeight
        );
      }
      p.pop();
    },
  };
}
