import p5 from 'p5';
import { makeNPC, NPC } from "./entities/npc";
import { makePlayer, Player } from "./entities/player";
import { makeTiledMap, TiledMap } from "./entities/map";
import { makeDialogBox, DialogBox } from "./entities/dialogBox";
import { makeCamera, Camera } from "./entities/camera";

export interface World {
  camera: Camera;
  player: Player;
    npcs: NPC[];
  map: TiledMap;
  dialogBox: DialogBox;
  questMarkerSprite: p5.Image | null;
  makeScreenFlash: boolean;
  alpha: number;
  blinkBack: boolean;
  easing: number;
  scale: number;
  load: () => void;
  setup: () => void;
  update: () => void;
  draw: () => void;
  keyPressed: () => void;
  mousePressed: () => void;
  checkInteraction: () => void;
  keyReleased: () => void;
  setPlayerGender: (gender: 'male' | 'female') => void;
  // Mobile controls
  mobileDirection: string | null;
  startMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  stopMove: () => void;
  interact: () => void;
}

export function makeWorld(p: p5): World {
  const player = makePlayer(p, 0, 0);
  const me = makeNPC(p, 0, 0, "/assets/me.png");
  const kid = makeNPC(p, 0, 0, "/assets/kid2.png");
  const wife = makeNPC(p, 0, 0, "/assets/wife.png");

  // Interactable Objects (coordinates relative to map origin)
  // You can add more objects here with their positions and dialogue
  interface InteractableObject {
    name: string;
    x: number; // relative to map
    y: number; // relative to map
    width: number;
    height: number;
    dialogue: string[];
    interacted: boolean; // Tracks if player has already interacted
    showMarker?: boolean; // Optional: show quest marker above object
    markerOffsetX?: number; // Optional: custom X offset for marker (default 0)
    markerOffsetY?: number; // Optional: custom Y offset for marker (default -20)
  }

  const interactableObjects: InteractableObject[] = [
    // Example: A bookshelf at map coordinates (64, 128)
    // Adjust these coordinates based on your Tiled map
    {
      name: "football",
      x: 133,
      y: 94,
      width: 32,
      height: 32,
      dialogue: ["I’ve been passionate about football since\nchildhood.", "The artistry of Wengerball lured me into\nsupporting Arsenal."],
      interacted: false
    },
    // {
    //   name: "door",
    //   x: 450,
    //   y: 93,
    //   width: 32,
    //   height: 32,
    //   dialogue: ["A sturdy wooden table."],
    //   interacted: false
    // },
        {
      name: "telescope",
      x: 20,
      y: 182,
      width: 64,
      height: 32,
      dialogue: ["I've loved stargazing since I was a kid. That\nfascination sparked my dream of space science.", "I primarily worked on scientific payloads\nfor satellites in grad school."],
      interacted: false,
      showMarker: true,
      markerOffsetX: 10,
      markerOffsetY: -10
    },
            {
      name: "bookshelf",
      x: 150,
      y: 111,
      width: 64,
      height: 32,
      dialogue: ["I double majored in Physics & EE at KAIST.\nI love diving deep into theories.",
        "I'm a generalist at heart. I enjoy the challenge\nof exploring and learning new fields."
      ],
      interacted: false,
      showMarker: true,
      markerOffsetX: 12,
      markerOffsetY: -10
    },
                {
      name: "computer",
      x: 78,
      y: 131,
      width: 32,
      height: 64,
      dialogue: ["Welcoming my daughter into the world prompted\nme to switch to a dev role for more flexibility.", "I now dedicate most of my time to raising her,\nwhile finding time to code whenever I can."],
      interacted: false,
      showMarker: true,
      markerOffsetX: 0,
      markerOffsetY: 0,
    },
                    {
      name: "chair",
      x: 100,
      y: 107,
      width: 32,
      height: 32,
      dialogue: ["Welcoming my daughter into the world prompted\nme to switch to a dev role for more flexibility.", "I now dedicate most of my time to raising her,\nwhile finding time to code whenever I can."],
      interacted: false,
    },
  ];

  // Patrol Behavior for Kid
  const createPatrolBehavior = () => {
      let state = 0; 
      let distTraveled = 0;
      const speed = 90; 
      const limit = 64; 
      const tileSize = 32;

      let isPaused = false;
      let playerLeftBufferTime = 0;
      const resumeDelay = 250; // 0.5 seconds

      const playerOverlapsTile = (tileX: number, tileY: number): boolean => {
          return !(
              player.x + player.width <= tileX ||
              player.x >= tileX + tileSize ||
              player.y + player.height <= tileY ||
              player.y >= tileY + tileSize
          );
      };

      const playerCenterInTile = (tileX: number, tileY: number): boolean => {
          const centerX = player.x + player.width / 2;
          const centerY = player.y + player.height / 2;
          return (
              centerX >= tileX &&
              centerX < tileX + tileSize &&
              centerY >= tileY &&
              centerY < tileY + tileSize
          );
      };

      const isPlayerInBuffer = (npc: NPC): boolean => {
          let forwardX: number, forwardY: number;
          let side1X: number, side1Y: number;
          let side2X: number, side2Y: number;

          switch (state) {
              case 0: 
                  forwardX = npc.x;
                  forwardY = npc.y - tileSize;
                  side1X = npc.x - tileSize;
                  side1Y = npc.y - tileSize;
                  side2X = npc.x + tileSize;
                  side2Y = npc.y - tileSize;
                  break;
              case 1: 
                  forwardX = npc.x + npc.width;
                  forwardY = npc.y;
                  side1X = npc.x + npc.width;
                  side1Y = npc.y - tileSize;
                  side2X = npc.x + npc.width;
                  side2Y = npc.y + tileSize;
                  break;
              case 2: 
                  forwardX = npc.x;
                  forwardY = npc.y + npc.height;
                  side1X = npc.x - tileSize;
                  side1Y = npc.y + npc.height;
                  side2X = npc.x + tileSize;
                  side2Y = npc.y + npc.height;
                  break;
              case 3: 
                  forwardX = npc.x - tileSize;
                  forwardY = npc.y;
                  side1X = npc.x - tileSize;
                  side1Y = npc.y - tileSize;
                  side2X = npc.x - tileSize;
                  side2Y = npc.y + tileSize;
                  break;
              default:
                  return false;
          }

          if (playerOverlapsTile(forwardX, forwardY)) return true;

          if (playerCenterInTile(side1X, side1Y)) return true;
          if (playerCenterInTile(side2X, side2Y)) return true;

          return false;
      };

      return (npc: NPC) => {
          const currentTime = p.millis();
          const playerInBuffer = isPlayerInBuffer(npc);

          if (playerInBuffer) {
              isPaused = true;
              playerLeftBufferTime = 0; 
              switch (state) {
                  case 0: npc.setAnim("idle-up"); break;
                  case 1: npc.setAnim("idle-side"); break;
                  case 2: npc.setAnim("idle-down"); break;
                  case 3: npc.setAnim("idle-side"); break;
              }
              return;
          }

          if (isPaused) {
              if (playerLeftBufferTime === 0) {
                  playerLeftBufferTime = currentTime;
              }

              if (currentTime - playerLeftBufferTime >= resumeDelay) {
                  isPaused = false;
                  playerLeftBufferTime = 0;
              } else {
                  return;
              }
          }

          const moveAmt = (speed * p.deltaTime) / 1000;
          distTraveled += moveAmt;

          switch (state) {
              case 0: 
                  npc.y -= moveAmt;
                  npc.setDirection("up");
                  npc.setAnim("run-up");
                  break;
              case 1: 
                  npc.x += moveAmt;
                  npc.setDirection("right");
                  npc.setAnim("run-side");
                  break;
              case 2: 
                  npc.y += moveAmt;
                  npc.setDirection("down");
                  npc.setAnim("run-down");
                  break;
              case 3: 
                  npc.x -= moveAmt;
                  npc.setDirection("left");
                  npc.setAnim("run-side");
                  break;
          }

          if (distTraveled >= limit) {
              const overshot = distTraveled - limit;
              if (state === 0) npc.y += overshot;
              if (state === 1) npc.x -= overshot;
              if (state === 2) npc.y -= overshot;
              if (state === 3) npc.x += overshot;

              distTraveled = 0;
              state = (state + 1) % 4;
          }
      };
  };

  kid.behavior = createPatrolBehavior();

  return {
    camera: makeCamera(p, 100, 0),
    player: player,
    npcs: [me, kid, wife],
    map: makeTiledMap(p, 100, -150),
    dialogBox: makeDialogBox(p, 0, 280),
    questMarkerSprite: null,
    makeScreenFlash: false,
    alpha: 0,
    blinkBack: false,
    easing: 3,
    scale: 1,

    load() {
      this.dialogBox.load();
      this.map.load(["/assets/interior_tileset.png", "/assets/christmas.png", "/assets/4th_gen_indoor_tileset.png"], "/maps/world.json");
      this.player.load();
      this.npcs.forEach(npc => npc.load());
      this.questMarkerSprite = p.loadImage("/assets/quest_marker.png");
    },
    setup() {
      this.map.prepareTiles();
      const spawnPoints = this.map.getSpawnPoints();
      if (spawnPoints) {
        for (const spawnPoint of spawnPoints) {
            switch (spawnPoint.name) {
            case "player":
                this.player.x = this.map.x + spawnPoint.x;
                this.player.y = this.map.y + spawnPoint.y + 32;
                break;
            case "npc":
                // me
                this.npcs[0].x = this.map.x + spawnPoint.x;
                this.npcs[0].y = this.map.y + spawnPoint.y + 32;
                break;
            case "npc2":
                // Kid
                this.npcs[1].x = this.map.x + spawnPoint.x;
                this.npcs[1].y = this.map.y + spawnPoint.y + 32;
                break;
            case "npc3":
                // wife
                this.npcs[2].x = this.map.x + spawnPoint.x;
                this.npcs[2].y = this.map.y + spawnPoint.y + 32;
                break;    
            default:
            }
        }
      }
      this.player.setup();
      this.camera.attachTo(this.player);

      this.npcs.forEach(npc => npc.setup());
    },

    update() {
      if (this.map.tiledData) {
        const mapW = this.map.getPixelWidth();
        const mapH = this.map.getPixelHeight();

        this.scale = Math.min(p.width / mapW, p.height / mapH);
    
        if (!isFinite(this.scale) || this.scale <= 0) this.scale = 1;
      }

      // Handle mobile direction input
      if (this.mobileDirection && !this.player.freeze) {
        const moveBy = (this.player.speed / 1000) * p.deltaTime;
        switch (this.mobileDirection) {
          case 'up':
            this.player.setDirection('up');
            this.player.setAnim('run-up');
            this.player.y -= moveBy;
            break;
          case 'down':
            this.player.setDirection('down');
            this.player.setAnim('run-down');
            this.player.y += moveBy;
            break;
          case 'left':
            this.player.setDirection('left');
            this.player.setAnim('run-side');
            this.player.x -= moveBy;
            break;
          case 'right':
            this.player.setDirection('right');
            this.player.setAnim('run-side');
            this.player.x += moveBy;
            break;
        }
      }

      this.camera.update(this.scale);
      this.player.update();
      this.npcs.forEach(npc => npc.update());
      this.dialogBox.update();
    },
    draw() {
      p.clear();
      p.background(0);
      
      p.push();
      p.scale(this.scale);
      
      this.npcs.forEach(npc => npc.handleCollisionsWith(this.player));
      
      this.map.draw(this.camera, this.player);
      this.npcs.forEach(npc => npc.draw(this.camera));
      this.player.draw(this.camera);

      p.push(); 
      for (const obj of interactableObjects) {
        if (obj.showMarker && !obj.interacted) {
          const objWorldX = this.map.x + obj.x + obj.width / 2;
          const objWorldY = this.map.y + obj.y;
          
          const offsetX = obj.markerOffsetX ?? 0;
          const offsetY = obj.markerOffsetY ?? -20;
          
          const screenX = objWorldX + this.camera.x + offsetX;
          const screenY = objWorldY + this.camera.y + offsetY;

          if (this.questMarkerSprite) {
            p.imageMode(p.CENTER);
            p.image(this.questMarkerSprite, screenX, screenY, 24, 24);
            p.imageMode(p.CORNER); 
          } else {
            p.fill(255, 215, 0);
            p.stroke(0);
            p.strokeWeight(2);
            p.textSize(20);
            p.textAlign(p.CENTER, p.BOTTOM);
            p.text("!", screenX, screenY);
          }
        }
      }
      p.pop(); 

      this.dialogBox.draw();
      
      p.pop();
    },

    keyPressed() {
      const key = p.key;
      const k = p.keyCode;
      const isInteractionKey =
        key === " " ||
        key === "Enter" ||
        k === 13 || // Enter
        key === "z" ||
        key === "Z" ||
        key === "ㅋ" || // Korean Z
        k === 90 || // Z keyCode
        key === "x" ||
        key === "X" ||
        key === "ㅌ" || // Korean X
        k === 88; // X keyCode

      if (!isInteractionKey) return;

      if (this.dialogBox.isVisible) {
        this.dialogBox.handleInput();
        return;
      }

      this.checkInteraction();
    },

    mousePressed() {
      if (this.dialogBox.isVisible) {
        this.dialogBox.handleInput();
        return;
      }
      
      this.checkInteraction();
    },

    checkInteraction() {
      if (this.player.freeze) return;
      if (p.millis() - this.dialogBox.lastCloseTime < 500) return;
      
      const playerTileX = Math.round((this.player.x - this.map.x) / 32);
      const playerTileY = Math.round((this.player.y - this.map.y) / 32);

      for (const obj of interactableObjects) {
        const objStartX = Math.round(obj.x / 32);
        const objStartY = Math.round(obj.y / 32);
        const objWidthTiles = Math.round(obj.width / 32);
        const objHeightTiles = Math.round(obj.height / 32);

        let interactionFound = false;

        for (let i = 0; i < objWidthTiles; i++) {
            for (let j = 0; j < objHeightTiles; j++) {
                const currentObjX = objStartX + i;
                const currentObjY = objStartY + j;

                const diffX = currentObjX - playerTileX;
                const diffY = currentObjY - playerTileY;

                const isAdjacent = (Math.abs(diffX) + Math.abs(diffY) === 1);

                if (isAdjacent) {
                    let isFacing = false;
                    if (diffX === 1 && this.player.direction === 'right') isFacing = true;
                    if (diffX === -1 && this.player.direction === 'left') isFacing = true;
                    if (diffY === 1 && this.player.direction === 'down') isFacing = true;
                    if (diffY === -1 && this.player.direction === 'up') isFacing = true;

                    if (isFacing) {
                        interactionFound = true;
                        break;
                    }
                }
            }
            if (interactionFound) break;
        }

        if (interactionFound) {
            this.player.freeze = true;
            obj.interacted = true;
            this.dialogBox.startDialogue(
                obj.dialogue,
                () => {
                    this.player.freeze = false;
                }
            );
            return;
        }
      }

      for (const npc of this.npcs) {
          const npcTileX = Math.round((npc.x - this.map.x) / 32);
          const npcTileY = Math.round((npc.y - this.map.y) / 32);

          const diffX = npcTileX - playerTileX;
          const diffY = npcTileY - playerTileY;

          const isAdjacent = (Math.abs(diffX) + Math.abs(diffY) === 1);

          if (isAdjacent) {
            let isFacing = false;
            if (diffX === 1 && this.player.direction === 'right') isFacing = true;
            if (diffX === -1 && this.player.direction === 'left') isFacing = true;
            if (diffY === 1 && this.player.direction === 'down') isFacing = true;
            if (diffY === -1 && this.player.direction === 'up') isFacing = true;
            
            if (isFacing) {
                if (npc === this.npcs[0]) {
                    this.player.freeze = true;
                    this.dialogBox.startDialogue(
                    [
                        "Welcome to my little pixel home!\nFeel free to poke around!",
                    ],
                    () => {
                        this.player.freeze = false;
                    }
                    );
                    return; 
                } else if (npc === this.npcs[1]) {
                    this.player.freeze = true;
                    const birthDate = new Date("2020-08-28");
                    const currentDate = new Date();
                    
                    let yearsOld = currentDate.getFullYear() - birthDate.getFullYear();
                    const m = currentDate.getMonth() - birthDate.getMonth();
                    
                    if (m < 0 || (m === 0 && currentDate.getDate() < birthDate.getDate())) {
                        yearsOld--;
                    }
                    const lastBirthday = new Date(birthDate);
                    lastBirthday.setFullYear(currentDate.getFullYear());
                    if (currentDate < lastBirthday) {
                        lastBirthday.setFullYear(currentDate.getFullYear() - 1);
                    }
                    
                    const diffTime = Math.abs(currentDate.getTime() - lastBirthday.getTime());
                    const daysRemaining = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                    const fetchPromise = (async () => {
                        try {
                            const { ref, get, set } = await import("firebase/database");
                            const { database } = await import("../firebase");
                            
                            const talkCountRef = ref(database, 'talkCount');
                            const snapshot = await get(talkCountRef);

                            let count = 1;
                            if (snapshot.exists()) {
                                count = snapshot.val();
                            }

                            const hasTalked = localStorage.getItem('hasTalkedToKid');
                            
                            if (!hasTalked) {
                                count = count + 1; 
                                set(talkCountRef, count).catch(() => {});
                                localStorage.setItem('hasTalkedToKid', 'true');
                            }
                            
                            return count;
                        } catch (e) {
                            return null;
                        }
                    })();

                    this.dialogBox.startDialogue(
                        [
                            `Hi there! My name is Woojoo.\nI'm ${yearsOld} years and ${daysRemaining} days old!`,
                            "I love eating yummy treats!"
                        ],
                        async () => {
                            let count = null;
                            try {
                                const timeout = new Promise(resolve => setTimeout(() => resolve(null), 3000));
                                count = await Promise.race([fetchPromise, timeout]);
                            } catch (e) { }

                            if (count !== null) {
                                this.dialogBox.startDialogue(
                                    [
                                        `You are person #${count} to talk to me!`,
                                    ],
                                    () => {
                                        this.player.freeze = false;
                                    }
                                );
                            } else {
                                this.dialogBox.startDialogue(
                                    [
                                        "I lost count...",
                                    ],
                                    () => {
                                        this.player.freeze = false;
                                    }
                                );
                            }
                        }
                    );
                    
                    return;
                }
            }
          }
      }
    },

    keyReleased() {
      if (this.dialogBox.isVisible) return;

      for (const key of [
        p.RIGHT_ARROW,
        p.LEFT_ARROW,
        p.UP_ARROW,
        p.DOWN_ARROW,
        87, 65, 83, 68 
      ]) {
        if (p.keyIsDown(key)) {
          return;
        }
      }

      switch (this.player.direction) {
        case "up":
          this.player.setAnim("idle-up");
          break;
        case "down":
          this.player.setAnim("idle-down");
          break;
        case "left":
        case "right":
          this.player.setAnim("idle-side");
          break;
        default:
      }
    },
    setPlayerGender(gender: 'male' | 'female') {
      this.player.setGender(gender);
    },

    // Mobile controls
    mobileDirection: null as string | null,

    startMove(direction: 'up' | 'down' | 'left' | 'right') {
      this.mobileDirection = direction;
    },

    stopMove() {
      this.mobileDirection = null;
      switch (this.player.direction) {
        case "up":
          this.player.setAnim("idle-up");
          break;
        case "down":
          this.player.setAnim("idle-down");
          break;
        case "left":
        case "right":
          this.player.setAnim("idle-side");
          break;
      }
    },

    interact() {
      if (this.dialogBox.isVisible) {
        this.dialogBox.handleInput();
      } else {
        this.checkInteraction();
      }
    }
  };
}
