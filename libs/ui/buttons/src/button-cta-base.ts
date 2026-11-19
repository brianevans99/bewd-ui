import { booleanAttribute, computed, Directive, ElementRef, inject, input, signal } from '@angular/core';

export type ButtonCtaVariant = 'default' | 'secondary' | 'tertiary' | 'success' | 'danger' | 'warning' | 'dark' | 'ghost';
export type ButtonCtaSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';

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

// Ripple colour is currentColor so it follows each variant and the consumer's theme without @theme tokens.
export const rippleStyles = `
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
`;

// Styling and ripple shared by the button and link CTAs. Each subclass adds the bindings for its own element.
@Directive({
  host: {
    '[class]': 'classes()',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointerup)': 'onPointerUp($event)',
    '(pointercancel)': 'pendingTouch = false',
    '(click)': 'onClick($event)',
  },
})
export abstract class ButtonCtaBase {
  readonly variant = input<ButtonCtaVariant>('default');
  readonly size = input<ButtonCtaSize>('base');
  // Full width by default; `fit` shrinks to the content. Only one width class is ever applied, so they can't conflict.
  readonly fit = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() =>
    [
      baseClasses,
      variantClasses[this.variant()],
      sizeClasses[this.size()],
      this.fit() ? 'w-fit' : 'w-full',
      this.stateClasses(),
    ].join(' ')
  );
  protected readonly ripples = signal<Ripple[]>([]);
  protected pendingTouch = false;

  protected readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private nextRippleId = 0;

  // Extra classes for the subclass's own state, read inside `classes`, so any signals it reads are tracked.
  protected stateClasses(): string {
    return '';
  }

  protected canRipple(): boolean {
    return true;
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
    // detail is 0 when the keyboard activated the element, so ripple from the centre.
    if (event.detail !== 0) return;
    const rect = this.host.getBoundingClientRect();
    this.addRipple(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  protected removeRipple(id: number): void {
    this.ripples.update((ripples) => ripples.filter((ripple) => ripple.id !== id));
  }

  private addRipple(clientX: number, clientY: number): void {
    if (!this.canRipple()) return;

    const rect = this.host.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    // Diameter reaches the farthest corner, so the circle always covers the whole element.
    const size = 2 * Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));
    const fade = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    this.ripples.update((ripples) => [...ripples, { id: this.nextRippleId++, x, y, size, fade }]);
  }
}
