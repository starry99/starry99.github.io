import p5 from 'p5';
import { makeCollidable } from "./collidable";
import { drawTile, getFramesPos } from "../utils";
import { Camera } from "./camera";

interface TiledLayer {
  name: string;
  type: string;
  data: number[];
  width: number;
  objects?: any[];
}

interface TiledTileset {
  firstgid: number;
  image: string;
}

interface TiledData {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: TiledLayer[];
  tilesets: TiledTileset[];
}

export interface TiledMap {
  tileWidth: number;
  tileHeight: number;
  x: number;
  y: number;
  tilesetURLs?: string[];
  tilesetImages?: p5.Image[];
  tiledData?: TiledData;
  // processedTilesets will store { firstgid, image, tilesPos } sorted by firstgid descending for easy lookup
  processedTilesets?: { firstgid: number; image: p5.Image; tilesPos: { x: number; y: number }[] }[];
  load: (tilesetURLs: string[], tiledMapURL: string) => void;
  prepareTiles: () => void;
  getSpawnPoints: () => any[] | undefined;
  getPixelWidth: () => number;
  getPixelHeight: () => number;
  draw: (camera: Camera, player: any) => void;
}

export function makeTiledMap(p: p5, x: number, y: number): TiledMap {
  return {
    tileWidth: 32,
    tileHeight: 32,
    x,
    y,
    load(tilesetURLs: string[], tiledMapURL: string) {
      this.tilesetURLs = tilesetURLs;
      this.tilesetImages = tilesetURLs.map((url) => p.loadImage(url));
      this.tiledData = p.loadJSON(tiledMapURL) as unknown as TiledData;
    },
    prepareTiles() {
      if (!this.tiledData || !this.tiledData.tilesets || !this.tilesetImages || !this.tilesetURLs) return;

      this.processedTilesets = [];

      for (const tilesetData of this.tiledData.tilesets) {
        const jsonImageName = tilesetData.image.split('/').pop() || '';
        const imageIndex = this.tilesetURLs.findIndex(url => url.includes(jsonImageName));
        
        if (imageIndex !== -1) {
          const image = this.tilesetImages[imageIndex];
          const nbCols = Math.floor(image.width / this.tileWidth);
          const nbRows = Math.floor(image.height / this.tileHeight);
          const tilesPos = getFramesPos(nbCols, nbRows, this.tileWidth, this.tileHeight);

          this.processedTilesets.push({
            firstgid: tilesetData.firstgid,
            image,
            tilesPos
          });
        }
      }
      
      this.processedTilesets.sort((a, b) => b.firstgid - a.firstgid);
    },
    getSpawnPoints() {
      if (!this.tiledData) return undefined;
      for (const layer of this.tiledData.layers) {
        if (layer.name === "SpawnPoints") {
          return layer.objects;
        }
      }
    },
    getPixelWidth() {
      if (!this.tiledData) return 0;
      return this.tiledData.width * this.tiledData.tilewidth;
    },
    getPixelHeight() {
      if (!this.tiledData) return 0;
      return this.tiledData.height * this.tiledData.tileheight;
    },
    draw(camera: Camera, player: any) {
      if (!this.tiledData || !this.processedTilesets) return;

      for (const layer of this.tiledData.layers) {
        if (layer.type === "tilelayer") {
          const currentTilePos = {
            x: this.x,
            y: this.y,
          };
          let nbOfTilesDrawn = 0;
          for (const tileNumber of layer.data) {
            if (nbOfTilesDrawn % layer.width === 0) {
              currentTilePos.x = this.x;
              currentTilePos.y += this.tileHeight;
            } else {
              currentTilePos.x += this.tileWidth;
            }
            nbOfTilesDrawn++;

            if (tileNumber === 0) continue;

            const tileset = this.processedTilesets.find(ts => tileNumber >= ts.firstgid);

            if (!tileset) continue;

            const tileIndex = tileNumber - tileset.firstgid;
            if (!tileset.tilesPos[tileIndex]) continue;

            drawTile(
              p,
              tileset.image,
              Math.round(currentTilePos.x + camera.x),
              Math.round(currentTilePos.y + camera.y),
              tileset.tilesPos[tileIndex].x,
              tileset.tilesPos[tileIndex].y,
              this.tileWidth,
              this.tileHeight
            );
          }
        }

        if (layer.type === "objectgroup" && layer.name === "Boundaries" && layer.objects) {
          for (const boundary of layer.objects) {
            const collidable = makeCollidable(
              p,
              this.x + boundary.x,
              this.y + boundary.y + this.tileHeight,
              boundary.width,
              boundary.height
            );
            collidable.preventPassthroughFrom(player);
            collidable.update(camera);
            collidable.draw();
          }
        }
      }
    },
  };
}
