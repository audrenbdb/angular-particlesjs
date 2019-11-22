import { Directive, ElementRef, Input, OnDestroy, HostListener, NgZone, OnInit } from '@angular/core';

@Directive({
  selector: '[repulse-particles]'
})
export class ParticlesDirective implements OnDestroy, OnInit {

  @Input() number: number = 80;
  @Input() speed: number = 6;
  @Input() linkWidth: number = 1;
  @Input() linkDistance: number = 120;
  @Input() size: number = 2;
  @Input() repulseDistance: number = 140;
  @Input() particleRGBA: string = "rgba(255,255,255, 1)";
  @Input() linkRGBA: string = "rgba(255, 255,255, .2)";

  interaction = {
    status: "mouseleave",
    pos_x: 0,
    pos_y: 0,
  };
  particlesList = [];
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  interval;
  requestId;

  constructor(
    public el: ElementRef,
    private ngZone: NgZone
  ) {
    
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.interaction.pos_x = null;
    this.interaction.pos_y = null;
    this.interaction.status = "mouseleave";
  }

  @HostListener('mousemove', ['$event']) onMouseMove(e) {
    this.interaction.pos_x = e.offsetX;
    this.interaction.pos_y = e.offsetY;
    this.interaction.status = "mousemove";
  }

  ngOnInit() {
    let canvas = this.el.nativeElement;
    canvas.style.height = "100%";
    canvas.style.width = "100%";
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    window.onresize = () => this.setCanvasSize();
    this.setCanvasSize();


    this.context.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < this.number; i++) {
      this.particlesList.push(this.createParticle());
    }    

    this.ngZone.runOutsideAngular(() => this.particlesDraw());
    setInterval(() => {
      this.particlesDraw();
    }, 6)
  }

  
  particlesDraw() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.update()
    for (let i = 0, l = this.particlesList.length; i < l; i++) {
      this.draw(this.particlesList[i]);
    }
    this.requestId = requestAnimationFrame(() => this.particlesDraw);
  }

  draw(p) {
    this.context.fillStyle = this.particleRGBA;
    this.context.beginPath();
    this.context.arc(p.x, p.y, this.size, 0, Math.PI * 2, false);
    this.context.closePath();
    this.context.fill();
  }


  update() {
    let p = {vx: 0, vy: 0, x: 0, y: 0};
    let p2 = {vx: 0, vy: 0, x: 0, y: 0};
    let ms = 0;

    for (let i = 0, l = this.particlesList.length; i < l; i++) {
      p = this.particlesList[i];
      ms = this.speed / 2;
      p.x += p.vx * ms;
      p.y += p.vy * ms;

      if (p.x - this.size > this.canvas.width) {
        p.x = -this.size;
        p.y = Math.random() * this.canvas.height;
      } else if (p.x + this.size < 0) {
        p.x = this.canvas.width + this.size;
        p.y = Math.random() * this.canvas.height;
      }
      if (p.y - this.size > this.canvas.height) {
        p.y = -this.size;
        p.x = Math.random() * this.canvas.width;
      } else if (p.y + this.size < 0) {
        p.y = this.canvas.height + this.size;
        p.x = Math.random() * this.canvas.width;
      }
      if (this.interaction.status === "mousemove") {
        this.repulse(p);
      }
      for (let j = i + 1; j < l; j++) {
        p2 = this.particlesList[j];
        this.linkParticles(p, p2);
      }
    }
  }

  linkParticles(p1, p2) {
    const dist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    if (dist <= this.linkDistance) {
      if (0.7 - dist / (1 / 0.7) / this.linkDistance > 0) {
        this.context.strokeStyle = this.linkRGBA;
        this.context.lineWidth = this.linkWidth;
        this.context.beginPath();
        this.context.moveTo(p1.x, p1.y);
        this.context.lineTo(p2.x, p2.y);
        this.context.stroke();
        this.context.closePath();
      }
    }
  }

  repulse(p) {
    const dx_mouse = p.x - this.interaction.pos_x,
      dy_mouse = p.y - this.interaction.pos_y,
      dist_mouse = Math.sqrt(Math.pow(dx_mouse, 2) + Math.pow(dy_mouse, 2));
    const velocity = 100,
      repulseFactor = Math.min(
        Math.max(
          (1 / this.repulseDistance) * (-1 * Math.pow(dist_mouse / this.repulseDistance, 2) + 1) * this.repulseDistance * velocity,
          0
        ),
        50
      );
    p.x = p.x + (dx_mouse / dist_mouse) * repulseFactor;
    p.y = p.y + (dy_mouse / dist_mouse) * repulseFactor;

  }

  createParticle() {
    let x = Math.random() * this.canvas.width;
    let y = Math.random() * this.canvas.height;
    const vx = Math.random() - 0.5;
    const vy = Math.random() - 0.5;

    if (x > this.canvas.width - this.size * 2) x -= this.size;
    else if (x < this.size * 2) x += this.size;
    if (y > this.canvas.height - this.size * 2) y -= this.size;
    else if (y < this.size * 2) y += this.size;

    return {x: x, y: y, vx: vx, vy: vy};
  }

  setCanvasSize() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
    cancelAnimationFrame(this.requestId);
  }

}
