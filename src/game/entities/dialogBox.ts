import p5 from 'p5';

export interface DialogBox {
  x: number;
  y: number;
  spriteRef: p5.Image | null;
  currentTime: number;
  previousTime: number;
  lineChars: string[] | null;
  line: string;
  isVisible: boolean;
  onCompleteCallback: (() => void) | null;
  isComplete: boolean;
  queue: string[];
  isTyping: boolean;
  lastCloseTime: number;
  load: () => void;
  setVisibility: (isVisible: boolean) => void;
  startDialogue: (lines: string[], onComplete?: () => void) => void;
  next: () => void;
  handleInput: () => void;
  update: () => void;
  draw: () => void;
}

export function makeDialogBox(p: p5, x: number, y: number): DialogBox {
  return {
    x,
    y,
    spriteRef: null,
    currentTime: 0,
    previousTime: 0,
    lineChars: null,
    line: "",
    isVisible: false,
    onCompleteCallback: null,
    isComplete: false,
    queue: [],
    isTyping: false,

    lastCloseTime: 0,

    load() {
      this.spriteRef = p.loadImage("/assets/overlay_message.png");
    },

    setVisibility(isVisible: boolean) {
      this.isVisible = isVisible;
      if (!isVisible) {
        this.lastCloseTime = p.millis();
        this.queue = [];
        this.line = "";
        this.lineChars = [];
      }
    },

    startDialogue(lines: string[], onComplete?: () => void) {
      this.queue = [...lines];
      this.onCompleteCallback = onComplete || null;
      this.setVisibility(true);
      this.next();
    },

    next() {
      if (this.queue.length === 0) {
        this.setVisibility(false);
        if (this.onCompleteCallback) {
          this.onCompleteCallback();
        }
        return;
      }

      const content = this.queue.shift();
      if (content) {
        this.lineChars = content.split("");
        this.line = "";
        this.isTyping = true;
        this.isComplete = false;
      }
    },

    handleInput() {
      if (!this.isVisible) return;

      if (this.isTyping) {
        if (this.lineChars) {
            this.line = this.line + this.lineChars.join("");
            this.lineChars = [];
        }
        this.isTyping = false;
        this.isComplete = true;
      } else {
        this.next();
      }
    },

    update() {
      if (!this.isVisible || !this.isTyping) return;
      
      this.currentTime += p.deltaTime;
      const durationPerFrame = 1000 / 60; // Speed of typing
      
      if (this.currentTime >= durationPerFrame) {
        this.currentTime -= durationPerFrame;

        if (this.lineChars) {
            const nextChar = this.lineChars.shift();

            if (!nextChar) {
              this.isTyping = false;
              this.isComplete = true;
              return;
            }

            this.line += nextChar;
        }
      }
    },
    
    draw() {
      if (!this.isVisible || !this.spriteRef) return;
      p.image(this.spriteRef, this.x, this.y);
      p.fill("black");
      p.textSize(24);
      p.text(this.line, this.x + 30, this.y + 42);

      if (this.isComplete) {
        if (p.frameCount % 60 < 30) { // Blink every half second
          p.fill("red");
          p.triangle(
            this.x + 480, this.y + 80,
            this.x + 490, this.y + 80,
            this.x + 485, this.y + 90
          );
        }
      }
    },
  };
}
