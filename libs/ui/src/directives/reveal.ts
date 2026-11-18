import { afterNextRender, DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';

export type RevealDirection = 'left' | 'right';

// Children start hidden and offset, then fade and slide in 80ms apart. Each child's --reveal-i is set inline.
// is-revealed is added by the observer. Focus-within also shows them, so a keyboard user's focus ring is never
// hidden inside a group that hasn't revealed yet.
const revealClasses = [
  'motion-safe:*:opacity-0',
  'motion-safe:*:transition-[opacity,translate]',
  'motion-safe:*:duration-600',
  'motion-safe:*:ease-[cubic-bezier(0.16,1,0.3,1)]',
  'motion-safe:*:delay-[calc(var(--reveal-i,0)*80ms)]',
  '[&.is-revealed>*]:opacity-100',
  '[&.is-revealed>*]:translate-x-0',
  'focus-within:*:opacity-100',
  'focus-within:*:translate-x-0',
];

const directionClasses: Record<RevealDirection, string> = {
  left: 'motion-safe:*:-translate-x-6',
  right: 'motion-safe:*:translate-x-6',
};

// One observer serves every [beReveal] host. Hosts reveal once, then stop being observed.
let observer: IntersectionObserver | undefined;

function sharedObserver(): IntersectionObserver {
  observer ??= new IntersectionObserver(
    (entries, self) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          self.unobserve(entry.target);
        }
      }
    },
    // Threshold 0 so blocks taller than the viewport still reveal.
    { threshold: 0, rootMargin: '0px 0px -10% 0px' }
  );
  return observer;
}

// Fades the host's children in from the given side, staggered, the first time the host scrolls into view.
@Directive({
  selector: '[beReveal]',
})
export class RevealDirective {
  readonly beReveal = input<RevealDirection | ''>('left');

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      // Content is only hidden once the observer is in place, so it can never stay invisible.
      if (typeof IntersectionObserver === 'undefined' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      Array.from(host.children).forEach((child, index) => {
        (child as HTMLElement).style.setProperty('--reveal-i', String(index));
      });
      host.classList.add(...revealClasses, directionClasses[this.beReveal() || 'left']);

      const io = sharedObserver();
      io.observe(host);
      destroyRef.onDestroy(() => io.unobserve(host));
    });
  }
}
