import p5 from 'p5';
import { makeCharacter, Character } from "./character";
import {
  drawTile,
  getFramesPos,
  checkCollision,
  preventOverlap,
} from "../utils";
import { Camera } from "./camera";

export interface NPC extends Character {
  x: number;
  y: number;
  screenX: number;
  screenY: number;
  spriteX: number;
  spriteY: number;
  load: () => void;
  prepareAnims: () => void;
  setup: () => void;
  update: () => void;
  draw: (camera: Camera) => void;
  isCollidingWith: (entity: any) => boolean;
  handleCollisionsWith: (entity: any, collisionEvent?: () => void) => void;
  behavior?: (npc: NPC) => void;
}

export function makeNPC(p: p5, x: number, y: number, spritePath: string): NPC {
  return {
    ...makeCharacter(p),
    x,
    y,
    screenX: x,
    screenY: y,
    spriteX: 0,
    spriteY: -15,
    load() {
      this.spriteRef = p.loadImage(spritePath);
    },

    prepareAnims() {
      this.frames = getFramesPos(4, 4, this.tileWidth, this.tileHeight);

      this.anims = {
        "idle-down": 0,
        "idle-side": 4,
        "idle-up": 12,
        "run-down": { from: 0, to: 3, loop: true, speed: 8 },
        "run-side": { from: 4, to: 7, loop: true, speed: 8 },
        "run-up": { from: 12, to: 15, loop: true, speed: 8 },
      };
    },

    setup() {
      this.prepareAnims();
      this.setAnim("idle-down");
    },

    update() {
      if (this.behavior) {
        this.behavior(this);
      }
      this.previousTime = this.animationTimer;
      this.animationTimer += p.deltaTime;
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
      // debugMode.drawHitbox(p, this);
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

    isCollidingWith(entity: any) {
      return checkCollision(this, entity);
    },

    handleCollisionsWith(entity: any, collisionEvent?: () => void) {
      // If the player has already collided and is frozen due to dialog
      // no need to recompute collision
      if (entity.freeze) return;

      const collision = checkCollision(this, entity);

      if (collision) {
        preventOverlap(this, entity);
        if (collisionEvent) collisionEvent();
      }
    },
  };
}
