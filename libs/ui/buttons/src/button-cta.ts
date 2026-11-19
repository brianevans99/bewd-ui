import { booleanAttribute, Component, DestroyRef, inject, input } from '@angular/core';
import { ButtonCtaBase, rippleStyles } from './button-cta-base';

export type { ButtonCtaSize, ButtonCtaVariant } from './button-cta-base';
export type ButtonCtaType = 'button' | 'submit' | 'reset';

@Component({
  // An attribute selector makes the host the native <button>, so consumers' ARIA, id and form attributes land on it.
  selector: 'button[be-button-cta]',
  host: {
    '[type]': 'type()',
    '[disabled]': 'disabled()',
    // Loading uses aria-disabled rather than disabled, so keyboard focus stays on the button.
    '[attr.aria-busy]': 'loading() || null',
    '[attr.aria-disabled]': 'loading() || null',
  },
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
    @if (loading()) {
      <svg class="size-4 motion-safe:animate-spin" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    }
    <ng-content />
  `,
  styles: rippleStyles,
})
export class ButtonCtaComponent extends ButtonCtaBase {
  readonly type = input<ButtonCtaType>('button');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });

  constructor() {
    super();
    // Capture phase runs before the consumer's (click) on the same element, so loading can block it.
    const blockWhileLoading = (event: MouseEvent): void => {
      if (!this.loading()) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    this.host.addEventListener('click', blockWhileLoading, { capture: true });
    inject(DestroyRef).onDestroy(() => this.host.removeEventListener('click', blockWhileLoading, { capture: true }));
  }

  protected override stateClasses(): string {
    return this.loading() ? 'cursor-progress' : '';
  }

  protected override canRipple(): boolean {
    return !this.disabled() && !this.loading();
  }
}
