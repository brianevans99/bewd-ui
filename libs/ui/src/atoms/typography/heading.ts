import { Component, computed, ElementRef, inject, input } from '@angular/core';

export type HeadingSize = 1 | 2 | 3 | 4 | 5 | 6;

// rem sizes follow the user's font size and zoom, and there are no fixed heights or line clamps, so text-spacing
// overrides can't clip. wrap-break-word keeps long words from overflowing narrow screens. No margins: spacing
// belongs to the consumer's layout.
const baseClasses = 'text-heading wrap-break-word';

const sizeClasses: Record<HeadingSize, string> = {
  1: 'text-5xl font-extrabold leading-tight tracking-tight',
  2: 'text-4xl font-bold leading-tight tracking-tight',
  3: 'text-3xl font-bold leading-snug',
  4: 'text-2xl font-bold leading-snug',
  5: 'text-xl font-bold leading-normal',
  6: 'text-lg font-bold leading-normal',
};

@Component({
  // An attribute selector makes the host the native heading, so the browser supplies its role and level,
  // and consumers' id and ARIA attributes land on it. It can't be applied to a <div>.
  selector: 'h1[be-heading], h2[be-heading], h3[be-heading], h4[be-heading], h5[be-heading], h6[be-heading]',
  host: {
    '[class]': 'headingClasses()',
  },
  template: `<ng-content />`,
})
export class HeadingComponent {
  // The tag is the level; size only changes the look. Without it, the heading looks like its own level.
  readonly size = input<HeadingSize>();

  private readonly level = Number(inject<ElementRef<HTMLHeadingElement>>(ElementRef).nativeElement.tagName[1]) as HeadingSize;

  protected readonly headingClasses = computed(() => [baseClasses, sizeClasses[this.size() ?? this.level]].join(' '));
}
