import p5 from 'p5';
import { checkCollision, preventOverlap } from "../utils";
import { Camera } from "./camera";

export interface Collidable {
  x: number;
  y: number;
  screenX: number;
  screenY: number;
  width: number;
  height: number;
  preventPassthroughFrom: (entity: any) => void;
  update: (camera: Camera) => void;
  draw: () => void;
}

export function makeCollidable(p: p5, x: number, y: number, width: number, height: number): Collidable {
  return {
    x,
    y,
    screenX: x,
    screenY: y,
    width,
    height,
    preventPassthroughFrom(entity: any) {
      const collision = checkCollision(this, entity);

      if (collision) preventOverlap(this, entity);
    },

    update(camera: Camera) {
      this.screenX = this.x + camera.x;
      this.screenY = this.y + camera.y;
    },

    draw() {},
  };
}
