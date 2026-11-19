import { Component, computed, input } from '@angular/core';

export type ContainerWidth = 'narrow' | 'wide';

// No fixed heights, so content reflows and text-spacing overrides can't clip it.
const baseClasses = 'mx-auto w-full px-4 py-8 lg:px-6 lg:py-16';

const widthClasses: Record<ContainerWidth, string> = {
  narrow: 'max-w-3xl',
  wide: 'max-w-7xl',
};

@Component({
  // The container adds spacing, not semantics. The surrounding <section> is the landmark, and only once it has a
  // name, such as aria-labelledby pointing at its heading. Backgrounds also go on the <section>, so they run full width.
  selector: 'div[be-container]',
  host: {
    '[class]': 'containerClasses()',
  },
  template: `<ng-content />`,
})
export class ContainerComponent {
  readonly width = input<ContainerWidth>('wide');

  protected readonly containerClasses = computed(() => [baseClasses, widthClasses[this.width()]].join(' '));
}
