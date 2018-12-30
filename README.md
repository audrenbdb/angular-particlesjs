Ported a standalone angular component of [particles.js](https://github.com/VincentGarreau/particles.js/) with <b>trimmed settings</b> to fit my needs. It probably should use directives at some points.

Edit to your liking.

# Usage

Simple example :

Import particles component in your app.module :
`import { ParticlesComponent } from './particles/particles.component';`
Add the component to your declarations :
`declarations: [
    AppComponent,
    ParticlesComponent,
    ...
  ]`

add `<app-particles></app-particles>` inside the div you wish to cover with particles.

# Stackblitz demo

https://angular-d7nfwj.stackblitz.io

Editor : https://stackblitz.com/edit/angular-d7nfwj
