import p5 from 'p5';

export interface Camera {
  x: number;
  y: number;
  entity: any;
  attachTo: (entity: any) => void;
  update: (scale?: number) => void;
}

export function makeCamera(p: p5, x: number, y: number): Camera {
  return {
    x,
    y,
    entity: null,
    attachTo(entity: any) {
      this.entity = entity;
    },

    update(scale = 1) {
      if (this.entity) {
        this.x = -this.entity.x + (p.width / 2) / scale;
        this.y = -this.entity.y + (p.height / 2) / scale;
      }
    },
  };
}
