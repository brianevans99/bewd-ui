import { Component } from '@angular/core';
import { ButtonCtaBase, rippleStyles } from './button-cta-base';

// Looks like the CTA button but navigates. No type, disabled or loading: a link has no form role and can't be disabled natively.
@Component({
  // An attribute selector makes the host the native <a>, so href, routerLink, target and ARIA work as usual.
  selector: 'a[be-button-cta]',
  template: `
    @for (ripple of ripples(); track ripple.id) {
      <span
        class="ripple"
        [class.ripple-fade]="ripple.fade"
        aria-hidden="true"
        [style.left.px]="ripple.fade ? null : ripple.x"
        [style.top.px]="ripple.fade ? null : ripple.y"
        [style.width.px]="ripple.fade ? null : ripple.size"
        [style.height.px]="ripple.fade ? null : ripple.size"
        (animationend)="removeRipple(ripple.id)"
      ></span>
    }
    <ng-content />
  `,
  styles: rippleStyles,
})
export class ButtonCtaLinkComponent extends ButtonCtaBase {}
