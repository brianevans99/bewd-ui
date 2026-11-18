import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from '../../testing/axe';
import { HeadingComponent, HeadingSize } from './heading';

@Component({
  imports: [HeadingComponent],
  template: `
    <h1 be-heading>Level 1</h1>
    <h2 be-heading>Level 2</h2>
    <h3 be-heading>Level 3</h3>
    <h4 be-heading>Level 4</h4>
    <h5 be-heading>Level 5</h5>
    <h6 be-heading>Level 6</h6>
  `,
})
class LevelsHostComponent {}

@Component({
  imports: [HeadingComponent],
  template: `<h2 be-heading [size]="size()">Account settings</h2>`,
})
class SizeHostComponent {
  readonly size = input<HeadingSize>();
}

@Component({
  imports: [HeadingComponent],
  template: `
    <section aria-labelledby="billing">
      <h2 be-heading id="billing" class="md:text-5xl" aria-describedby="billing-note">
        Billing <em data-testid="emphasis">details</em>
      </h2>
      <p id="billing-note">Update your card and invoices.</p>
    </section>
  `,
})
class SectionHostComponent {}

const levels: HeadingSize[] = [1, 2, 3, 4, 5, 6];

const sizes: [HeadingSize, string][] = [
  [1, 'text-5xl font-extrabold leading-tight tracking-tight'],
  [2, 'text-4xl font-bold leading-tight tracking-tight'],
  [3, 'text-3xl font-bold leading-snug'],
  [4, 'text-2xl font-bold leading-snug'],
  [5, 'text-xl font-bold leading-normal'],
  [6, 'text-lg font-bold leading-normal'],
];

// Angular sorts the class list, so check each class rather than a substring.
function expectClasses(element: HTMLElement, classes: string): void {
  for (const className of classes.split(' ')) {
    expect(element.classList).toContain(className);
  }
}

describe('HeadingComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeadingComponent, LevelsHostComponent, SizeHostComponent, SectionHostComponent],
    }).compileComponents();
  });

  it.each(sizes)('styles a native h%s as its own level by default', (level, classes) => {
    const fixture = TestBed.createComponent(LevelsHostComponent);
    fixture.detectChanges();

    const heading: HTMLElement = fixture.nativeElement.querySelector(`h${level}`);

    expect(heading.textContent).toContain(`Level ${level}`);
    expectClasses(heading, `text-heading wrap-break-word ${classes}`);
  });

  it.each(sizes)('applies the size %s classes and keeps the h2 tag', (size, classes) => {
    const fixture = TestBed.createComponent(SizeHostComponent);
    fixture.componentRef.setInput('size', size);
    fixture.detectChanges();

    const heading: HTMLElement = fixture.nativeElement.querySelector('h2');

    expectClasses(heading, classes);
    expect(heading.tagName).toBe('H2');
  });

  it('applies only one size, so size classes never conflict', () => {
    const fixture = TestBed.createComponent(SizeHostComponent);
    fixture.componentRef.setInput('size', 4);
    fixture.detectChanges();

    const heading: HTMLElement = fixture.nativeElement.querySelector('h2');

    expect(heading.classList).toContain('text-2xl');
    expect(heading.classList).not.toContain('text-4xl');
  });

  it('goes back to its own level when size is cleared', () => {
    const fixture = TestBed.createComponent(SizeHostComponent);
    fixture.componentRef.setInput('size', 4);
    fixture.detectChanges();
    fixture.componentRef.setInput('size', undefined);
    fixture.detectChanges();

    expectClasses(fixture.nativeElement.querySelector('h2'), 'text-4xl font-bold');
  });

  it('keeps native attributes and consumer classes, and projects content', () => {
    const fixture = TestBed.createComponent(SectionHostComponent);
    fixture.detectChanges();

    const heading: HTMLElement = fixture.nativeElement.querySelector('h2');

    expect(heading.id).toBe('billing');
    expect(heading.getAttribute('aria-describedby')).toBe('billing-note');
    expect(heading.classList).toContain('md:text-5xl');
    expect(heading.classList).toContain('text-4xl');
    expect(heading.textContent).toContain('Billing');
    expect(heading.querySelector('[data-testid="emphasis"]')).not.toBeNull();
  });

  describe('accessibility', () => {
    it('has no violations across all six levels', async () => {
      const fixture = TestBed.createComponent(LevelsHostComponent);
      fixture.detectChanges();

      expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });

    it.each(levels)('has no violations with size %s', async (size) => {
      const fixture = TestBed.createComponent(SizeHostComponent);
      fixture.componentRef.setInput('size', size);
      fixture.detectChanges();

      expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });

    it('has no violations when it labels a section', async () => {
      const fixture = TestBed.createComponent(SectionHostComponent);
      fixture.detectChanges();

      expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });
  });
});
