import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from '../../testing/axe';
import { HeadingComponent } from '../typography/heading';
import { ContainerComponent, ContainerWidth } from './container';

@Component({
  imports: [ContainerComponent, HeadingComponent],
  template: `
    <section aria-labelledby="pricing-title" class="bg-neutral-primary">
      <div be-container [width]="width()" id="pricing" class="text-center" data-testid="container">
        <h2 be-heading id="pricing-title">Pricing</h2>
        <p>One plan, no surprises.</p>
      </div>
    </section>
  `,
})
class SectionHostComponent {
  readonly width = input<ContainerWidth>('wide');
}

@Component({
  imports: [ContainerComponent],
  template: `<div be-container>Content</div>`,
})
class DefaultHostComponent {}

const baseClasses = 'mx-auto w-full px-4 py-8 lg:px-6 lg:py-16';

const widths: [ContainerWidth, string, string][] = [
  ['narrow', 'max-w-3xl', 'max-w-7xl'],
  ['wide', 'max-w-7xl', 'max-w-3xl'],
];

// Angular sorts the class list, so check each class rather than a substring.
function expectClasses(element: HTMLElement, classes: string): void {
  for (const className of classes.split(' ')) {
    expect(element.classList).toContain(className);
  }
}

describe('ContainerComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContainerComponent, SectionHostComponent, DefaultHostComponent],
    }).compileComponents();
  });

  it('defaults to the wide width with the base spacing', () => {
    const fixture = TestBed.createComponent(DefaultHostComponent);
    fixture.detectChanges();

    expectClasses(fixture.nativeElement.querySelector('div'), `${baseClasses} max-w-7xl`);
  });

  it.each(widths)('applies only the %s width class', (width, applied, other) => {
    const fixture = TestBed.createComponent(SectionHostComponent);
    fixture.componentRef.setInput('width', width);
    fixture.detectChanges();

    const container: HTMLElement = fixture.nativeElement.querySelector('[data-testid="container"]');

    expectClasses(container, `${baseClasses} ${applied}`);
    expect(container.classList).not.toContain(other);
  });

  it('keeps native attributes and consumer classes, and projects content', () => {
    const fixture = TestBed.createComponent(SectionHostComponent);
    fixture.detectChanges();

    const container: HTMLElement = fixture.nativeElement.querySelector('[data-testid="container"]');

    expect(container.id).toBe('pricing');
    expect(container.classList).toContain('text-center');
    expect(container.querySelector('h2')?.textContent).toContain('Pricing');
    expect(container.querySelector('p')).not.toBeNull();
  });

  it('adds no role of its own, so the section stays the landmark', () => {
    const fixture = TestBed.createComponent(SectionHostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="container"]').hasAttribute('role')).toBe(false);
  });

  describe('accessibility', () => {
    it.each(widths)('has no violations inside a labelled section at the %s width', async (width) => {
      const fixture = TestBed.createComponent(SectionHostComponent);
      fixture.componentRef.setInput('width', width);
      fixture.detectChanges();

      expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });
  });
});
