# Particles.js angular directive

Port of the particles.js library from Vincent Garreau into a directive.

The library has been **trimmed** as much as I could to fit my needs (repulse version of the library) and be ligthweight. There are still quite a few options, listed below.

## Usage

- Copy this directive.
- Import it into your app modules `declarations` array.
- Inside the div you want to cover with particles, add a canvas element with `repulse-particles` directive such as :

```
<div>
  <canvas repulse-particles></canvas>
</div>
```
## Options

All the following options can be passed as parameters :

```
@Input() number: number;
@Input() speed: number;
@Input() linkWidth: number;
@Input() linkDistance: number;
@Input() size: number;
@Input() repulseDistance: number;
@Input() particleRGBA: string;
@Input() linkRGBA: string;
@Input() bounce: boolean;
```

Example : 

```
<canvas repulse-particles number=120>
```

All defaults values can be found in the directive.

## Stackblitz demo

**app** : https://angular-dt2cjg.stackblitz.io

**editor** : https://stackblitz.com/edit/angular-dt2cjg
