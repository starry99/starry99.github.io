import p5 from 'p5';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function checkCollision(objA: Rect, objB: Rect): boolean {
  return !(
    objA.x + objA.width < objB.x ||
    objA.x > objB.x + objB.width ||
    objA.y + objA.height < objB.y ||
    objA.y > objB.y + objB.height
  );
}

export function preventOverlap(objA: Rect, objB: Rect): void {
  const overlapX =
    Math.min(objA.x + objA.width, objB.x + objB.width) -
    Math.max(objA.x, objB.x);
  const overlapY =
    Math.min(objA.y + objA.height, objB.y + objB.height) -
    Math.max(objA.y, objB.y);

  if (overlapX < overlapY) {
    if (objA.x < objB.x) {
      objB.x = objA.x + objA.width;
      return;
    }
    objB.x = objA.x - objB.width;
    return;
  }

  if (objA.y < objB.y) {
    objB.y = objA.y + objA.height;
    return;
  }
  objB.y = objA.y - objB.height;
}

export function isMaxOneKeyDown(p: p5): boolean {
  let isOnlyOneKeyDown = false;
  
  for (const key of [p.RIGHT_ARROW, p.LEFT_ARROW, p.UP_ARROW, p.DOWN_ARROW, 87, 65, 83, 68]) {
    if (!isOnlyOneKeyDown && p.keyIsDown(key)) {
      isOnlyOneKeyDown = true;
      continue;
    }

    if (isOnlyOneKeyDown && p.keyIsDown(key)) {
      return false;
    }
  }

  return true;
}

export function getFramesPos(nbCols: number, nbRows: number, tileWidth: number, tileHeight: number): { x: number; y: number }[] {
  const framesPos = [];
  let currentTileX = 0;
  let currentTileY = 0;
  for (let i = 0; i < nbRows; i++) {
    for (let j = 0; j < nbCols; j++) {
      framesPos.push({ x: currentTileX, y: currentTileY });
      currentTileX += tileWidth;
    }
    currentTileX = 0;
    currentTileY += tileHeight;
  }

  return framesPos;
}

export function drawTile(
  p: p5,
  src: p5.Image,
  destinationX: number,
  destinationY: number,
  srcX: number,
  srcY: number,
  tileWidth: number,
  tileHeight: number
): void {
  p.image(
    src,
    destinationX,
    destinationY,
    tileWidth,
    tileHeight,
    srcX,
    srcY,
    tileWidth,
    tileHeight
  );
}
