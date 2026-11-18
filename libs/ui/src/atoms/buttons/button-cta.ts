import { booleanAttribute, Component, computed, DestroyRef, ElementRef, inject, input, signal } from '@angular/core';

export type ButtonCtaVariant = 'default' | 'secondary' | 'tertiary' | 'success' | 'danger' | 'warning' | 'dark' | 'ghost';
export type ButtonCtaSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';
export type ButtonCtaType = 'button' | 'submit' | 'reset';

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
  fade: boolean;
}

const baseClasses = 'relative overflow-hidden inline-flex items-center justify-center gap-2 cursor-pointer box-border border font-medium rounded-base focus-visible:outline-4 focus-visible:outline-offset-1 motion-safe:transition-colors disabled:cursor-not-allowed disabled:bg-disabled disabled:text-fg-disabled disabled:border-transparent disabled:shadow-none';

const variantClasses: Record<ButtonCtaVariant, string> = {
  default: 'text-white bg-brand border-transparent hover:bg-brand-strong focus-visible:outline-brand-medium shadow-xs',
  secondary: 'text-body bg-neutral-secondary-medium border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus-visible:outline-neutral-tertiary shadow-xs',
  tertiary: 'text-body bg-neutral-primary-soft border-default hover:bg-neutral-secondary-medium hover:text-heading focus-visible:outline-neutral-tertiary-soft shadow-xs',
  success: 'text-white bg-success border-transparent hover:bg-success-strong focus-visible:outline-success-medium shadow-xs',
  danger: 'text-white bg-danger border-transparent hover:bg-danger-strong focus-visible:outline-danger-medium shadow-xs',
  warning: 'text-white bg-warning border-transparent hover:bg-warning-strong focus-visible:outline-warning-medium shadow-xs',
  dark: 'text-white bg-dark border-transparent hover:bg-dark-strong focus-visible:outline-neutral-tertiary shadow-xs',
  ghost: 'text-heading bg-transparent border-transparent hover:bg-neutral-secondary-medium focus-visible:outline-neutral-tertiary'
};

const sizeClasses: Record<ButtonCtaSize, string> = {
  xs: 'text-xs px-3 py-1.5 leading-5',
  sm: 'text-sm px-3 py-2 leading-5',
  base: 'text-sm px-4 py-2.5 leading-5',
  lg: 'text-base px-5 py-3',
  xl: 'text-base px-6 py-3.5'
};

@Component({
  // An attribute selector makes the host the native <button>, so consumers' ARIA, id and form attributes land on it.
  selector: 'button[be-button-cta]',
  host: {
    '[class]': 'buttonClasses()',
    '[type]': 'type()',
    '[disabled]': 'disabled()',
    // Loading uses aria-disabled rather than disabled, so keyboard focus stays on the button.
    '[attr.aria-busy]': 'loading() || null',
    '[attr.aria-disabled]': 'loading() || null',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointerup)': 'onPointerUp($event)',
    '(pointercancel)': 'pendingTouch = false',
    '(click)': 'onClick($event)',
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
  // Ripple colour is currentColor so it follows each variant and the consumer's theme without @theme tokens.
  styles: `
    .ripple {
      position: absolute;
      border-radius: 50%;
      translate: -50% -50%;
      background: currentColor;
      opacity: 0;
      pointer-events: none;
      animation: be-ripple 300ms ease-out;
    }

    /* Reduced motion: the whole surface fades instead of a circle growing from the press point. */
    .ripple-fade {
      inset: 0;
      translate: none;
      border-radius: inherit;
      animation: be-ripple-fade 300ms ease-out;
    }

    @keyframes be-ripple {
      from { scale: 0; opacity: 0.3; }
      to { scale: 1; opacity: 0; }
    }

    @keyframes be-ripple-fade {
      from { opacity: 0.2; }
      to { opacity: 0; }
    }
  `,
})
export class ButtonCtaComponent {
  readonly variant = input<ButtonCtaVariant>('default');
  readonly size = input<ButtonCtaSize>('base');
  readonly type = input<ButtonCtaType>('button');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  // Full width by default; `fit` shrinks to the content. Only one width class is ever applied, so they can't conflict.
  readonly fit = input(false, { transform: booleanAttribute });

  protected readonly buttonClasses = computed(() =>
    [
      baseClasses,
      variantClasses[this.variant()],
      sizeClasses[this.size()],
      this.fit() ? 'w-fit' : 'w-full',
      this.loading() ? 'cursor-progress' : '',
    ].join(' ')
  );
  protected readonly ripples = signal<Ripple[]>([]);
  protected pendingTouch = false;

  private readonly host = inject<ElementRef<HTMLButtonElement>>(ElementRef).nativeElement;
  private nextRippleId = 0;

  constructor() {
    // Capture phase runs before the consumer's (click) on the same element, so loading can block it.
    const blockWhileLoading = (event: MouseEvent): void => {
      if (!this.loading()) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    this.host.addEventListener('click', blockWhileLoading, { capture: true });
    inject(DestroyRef).onDestroy(() => this.host.removeEventListener('click', blockWhileLoading, { capture: true }));
  }

  protected onPointerDown(event: PointerEvent): void {
    if (event.button !== 0) return;
    // A touch may turn into a scroll, which fires pointercancel instead of pointerup, so wait for pointerup.
    if (event.pointerType === 'touch') {
      this.pendingTouch = true;
      return;
    }
    this.addRipple(event.clientX, event.clientY);
  }

  protected onPointerUp(event: PointerEvent): void {
    if (!this.pendingTouch) return;
    this.pendingTouch = false;
    this.addRipple(event.clientX, event.clientY);
  }

  protected onClick(event: MouseEvent): void {
    // detail is 0 when Enter or Space activated the button, so ripple from the centre.
    if (event.detail !== 0) return;
    const rect = this.host.getBoundingClientRect();
    this.addRipple(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  protected removeRipple(id: number): void {
    this.ripples.update((ripples) => ripples.filter((ripple) => ripple.id !== id));
  }

  private addRipple(clientX: number, clientY: number): void {
    if (this.disabled() || this.loading()) return;

    const rect = this.host.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    // Diameter reaches the farthest corner, so the circle always covers the whole button.
    const size = 2 * Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));
    const fade = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    this.ripples.update((ripples) => [...ripples, { id: this.nextRippleId++, x, y, size, fade }]);
  }
}
