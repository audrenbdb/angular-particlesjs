# Particles.js angular directive

Port of the particles.js library from Vincent Garreau into a directive.

The library has been **trimmed** and optimized as much as I could (repulse version of the library). There are still quite a few options, listed below.

Performance wise, this directive is an **upgrade** over the original library.

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
@Input() particleHex: string;
@Input() linkHex: string;
@Input() bounce: boolean;
```

Example : 

```
<canvas repulse-particles number=120>
```

All defaults values can be found in the directive.

## Demo & editor

**demo** : https://audrenbdb.github.io/particles/index.html

**editor** : https://stackblitz.com/edit/angular-dt2cjg
