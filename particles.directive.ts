import { Directive, ElementRef, Input, OnDestroy, HostListener, NgZone, OnInit } from "@angular/core";

@Directive({
  selector: "[repulse-particles]"
})
export class ParticlesDirective implements OnDestroy, OnInit {

  @Input() number: number = 80;
  @Input() speed: number = 6;
  @Input() linkWidth: number = 1;
  @Input() linkDistance: number = 160;
  @Input() size: number = 2;
  @Input() repulseDistance: number = 140;
  @Input() particleRGB: string = "255, 255, 255";
  particleRGBA: string = "rgba(255, 255, 255, 1)";
  @Input() linkRGB: string = "255, 255, 255";
  @Input() bounce: boolean = true;

  interaction = {
    status: "mouseleave",
    pos_x: 0,
    pos_y: 0,
  };
  particlesList = [];
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  animationFrame;

  boundary;
  quadTree;

  constructor(
    public el: ElementRef,
  ) {
    this.canvas = this.el.nativeElement;
    this.canvas.style.height = "100%";
    this.canvas.style.width = "100%";
    this.context = this.canvas.getContext("2d"); 
    this.particleRGBA = `rgba(${this.particleRGB}, 1)`
    this.setCanvasSize();   
  }

  ngOnInit() {
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.animate();
  }

  @HostListener("window:resize") onResize() {
    this.setCanvasSize();
  }

  @HostListener("mouseleave") onMouseLeave() {
    this.interaction.pos_x = null;
    this.interaction.pos_y = null;
    this.interaction.status = "mouseleave";
  }

  @HostListener("mousemove", ["$event"]) onMouseMove(e) {
    this.interaction.pos_x = e.offsetX;
    this.interaction.pos_y = e.offsetY;
    this.interaction.status = "mousemove";
  }

  @HostListener("change") ngOnChanges() {
    this.particlesList = [];
    for (let i = 0; i < this.number; i++) {
      let p: Particle = this.createParticle();
      this.particlesList.push(this.createParticle());
      this.quadTree.insert(p);
    }  
  }


  animate() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.update();
    this.animationFrame = requestAnimationFrame(this.animate.bind(this));
  }

  draw(p: Particle) {
    this.context.beginPath();
    this.context.arc(p.x, p.y, this.size, 0, Math.PI * 2, false);
    this.context.closePath();
    this.context.fill();
  }


  update() {
    let p: Particle;
    let ms = 0;
    this.quadTree.clear();

    for (let i = 0, l = this.particlesList.length; i < l; i++) {
      p = this.particlesList[i];
      ms = this.speed / 2;
      p.x += p.vx * ms;
      p.y += p.vy * ms;

      let new_pos = this.bounce ? {
        x_left: this.size,
        x_right: this.canvas.width,
        y_top: this.size,
        y_bottom: this.canvas.height
      } : {
          x_left: -this.size,
          x_right: this.canvas.width + this.size,
          y_top: -this.size,
          y_bottom: this.canvas.height + this.size,
        }

      if (p.x - this.size > this.canvas.width) {
        p.x = new_pos.x_left;
        p.y = Math.random() * this.canvas.height;
      } else if (p.x + this.size < 0) {
        p.x = new_pos.x_right;
        p.y = Math.random() * this.canvas.height;
      }
      if (p.y - this.size > this.canvas.height) {
        p.y = new_pos.y_top;
        p.x = Math.random() * this.canvas.width;
      } else if (p.y + this.size < 0) {
        p.y = new_pos.y_bottom;
        p.x = Math.random() * this.canvas.width;
      }

      if (this.bounce) {
        if (p.x + this.size > this.canvas.width) p.vx = -p.vx;
        else if (p.x - this.size < 0) p.vx = -p.vx;
        if (p.y + this.size > this.canvas.height) p.vy = -p.vy;
        else if (p.y - this.size < 0) p.vy = -p.vy;
      }

      if (this.interaction.status === "mousemove") {
        this.repulse(p);
      }


      p.circle.x = p.x;
      p.circle.y = p.y;
      p.circle.r = this.linkDistance;
      this.quadTree.insert(p);

      this.draw(p);
    }

    let explored = [];
    var i;
    var j;
    for (i = 0; i < this.particlesList.length; i++) {
      let links = this.quadTree.query(this.particlesList[i].circle)
      for (j = 0; j < links.length; j++) {
        if (links[j] !== this.particlesList[i] && !explored.includes(links[j])) {
          this.linkParticles(this.particlesList[i], links[j]);
        }
      }
      explored.push(this.particlesList[i])
    }
  }

  linkParticles(p1: Particle, p2: Particle) {
    let opacityValue = 1;
    const dist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    opacityValue = 1 - dist / (.7 * this.linkDistance);
    this.context.strokeStyle = `rgba(${this.linkRGB}, ${opacityValue})`;
    this.context.lineWidth = this.linkWidth;
    this.context.beginPath();
    this.context.moveTo(p1.x, p1.y);
    this.context.lineTo(p2.x, p2.y);
    this.context.stroke();
    this.context.closePath();
  }

  repulse(p: Particle) {
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
    let posX = p.x + (dx_mouse / dist_mouse) * repulseFactor;
    let posY = p.y + (dy_mouse / dist_mouse) * repulseFactor;

    if (this.bounce) {
      if (posX - this.size > 0 && posX + this.size < this.canvas.width) p.x = posX;
      if (posY - this.size > 0 && posY + this.size < this.canvas.height) p.y = posY
    } else {
      p.x = posX;
      p.y = posY;
    }
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

    let particle = {
      x: x,
      y: y,
      vx: vx,
      vy: vy,
      circle: new Circle(x, y, this.size)
    };

    return particle;
  }

  setCanvasSize() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.boundary = new Rectangle(
      this.canvas.width / 2,
      this.canvas.height / 2,
      this.canvas.width,
      this.canvas.height,
    );
    this.quadTree = new QuadTree(this.boundary, 4);
    this.context = this.canvas.getContext("2d");
    this.context.fillStyle = this.particleRGBA;
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrame);
  }
}

class Circle {
  x;
  y;
  r;
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
  }

  contains(point) {
    let d = Math.pow((point.x - this.x), 2) + Math.pow((point.y - this.y), 2);
    return d <= this.r * this.r;
  }

  intersects(range) {
    let xDist = Math.abs(range.x - this.x);
    let yDist = Math.abs(range.y - this.y);

    let r = this.r;

    let w = range.w;
    let h = range.h;

    let edges = Math.pow((xDist - w), 2) + Math.pow((yDist - h), 2);

    if (xDist > (r + w) || yDist > (r + h)) return false;
    if (xDist <= w || yDist <= h) return true;
    return edges <= this.r * this.r;
  }
}

interface Particle {
  x: number,
  y: number,
  vx: number,
  vy: number,
  circle: Circle,
}

class Rectangle {
  x;
  y;
  w;
  h;
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  contains(point) {
    return (point.x >= this.x - this.w &&
      point.x <= this.x + this.w &&
      point.y >= this.y - this.h &&
      point.y <= this.y + this.h);
  }

  intersects(range) {
    return !(
      range.x - range.w > this.x + this.w ||
      range.x + range.w < this.x - this.w ||
      range.y - range.h > this.y + this.h ||
      range.y + range.h < this.y - this.h
    );
  }
}

class QuadTree {
  boundary;
  capacity;
  points;

  northWest;
  northEast;
  southWest;
  southEast;

  divided;
  constructor(boundary, capacity) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.points = [];
    this.divided = false;
  }

  insert (point) {
    if (!this.boundary.contains(point)) return false
    if (this.points.length < this.capacity) {
      this.points.push(point)
      return true
    }
    if (!this.divided) {
      this.subdivide()
      this.divided = true
    }
    if (
      this.northEast.insert(point) ||
      this.northWest.insert(point) ||
      this.southEast.insert(point) ||
      this.southWest.insert(point)
    ) { return true }
  }

  subdivide () {
    let x = this.boundary.x
    let y = this.boundary.y
    let w = this.boundary.w / 2
    let h = this.boundary.h / 2

    let ne = new Rectangle(x + w, y - h, w, h)
    let nw = new Rectangle(x - w, y - h, w, h)
    let se = new Rectangle(x + w, y + h, w, h)
    let sw = new Rectangle(x - w, y + h, w, h)

    this.northWest = new QuadTree(ne, this.capacity)
    this.northEast = new QuadTree(nw, this.capacity)
    this.southWest = new QuadTree(se, this.capacity)
    this.southEast = new QuadTree(sw, this.capacity)

    this.divided = true
  }

  query (range, found = []) {
    if (this.boundary.intersects(range)) {
      found.push(...this.points.filter((p) => range.contains(p)));
      if (this.divided) {
          this.northEast.query(range, found)
          this.northWest.query(range, found)
          this.southEast.query(range, found)
          this.southWest.query(range, found)
      }
      return found
    }
  }

  clear () {
    if (this.divided) {
      delete this.northEast
      delete this.northWest
      delete this.southEast
      delete this.southWest
    }
    this.points = []
    this.divided = false
  }

}
