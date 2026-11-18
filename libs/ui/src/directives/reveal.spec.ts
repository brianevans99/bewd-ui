import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ContainerComponent, ContainerWidth } from '../atoms/layout/container';
import { axe } from '../testing/axe';
import { RevealDirection, RevealDirective } from './reveal';

@Component({
  imports: [RevealDirective],
  template: `
    <div [beReveal]="direction()">
      <h2>Heading</h2>
      <p>Intro</p>
    </div>
  `,
})
class HostComponent {
  readonly direction = input<RevealDirection | ''>('right');
}

@Component({
  imports: [ContainerComponent, RevealDirective],
  template: `
    <section aria-labelledby="contact-title">
      <div be-container [width]="width()" beReveal="right">
        <h2 id="contact-title">Get started</h2>
        <a href="#form">Contact me</a>
      </div>
    </section>
  `,
})
class ContainerHostComponent {
  readonly width = input<ContainerWidth>('wide');
}

// Records the shared observer so a test can fire intersections at it.
class RecordingObserver {
  static instance: RecordingObserver | undefined;
  readonly observed = new Set<Element>();

  constructor(private readonly callback: IntersectionObserverCallback) {
    RecordingObserver.instance = this;
  }

  observe(target: Element): void {
    this.observed.add(target);
  }

  unobserve(target: Element): void {
    this.observed.delete(target);
  }

  disconnect(): void {
    this.observed.clear();
  }

  intersect(target: Element): void {
    this.callback([{ target, isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
}

describe('RevealDirective', () => {
  const originalObserver = window.IntersectionObserver;

  beforeEach(() => {
    window.IntersectionObserver = RecordingObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    window.IntersectionObserver = originalObserver;
    delete (window as { matchMedia?: unknown }).matchMedia;
  });

  async function render(direction: RevealDirection | '' = 'right'): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentRef.setInput('direction', direction);
    await fixture.whenStable();
    return fixture.nativeElement.querySelector('div');
  }

  it('hides the children until the host scrolls into view, then reveals once', async () => {
    const host = await render();
    const children = Array.from(host.children) as HTMLElement[];
    const observer = RecordingObserver.instance as RecordingObserver;

    expect(host.classList).toContain('motion-safe:*:opacity-0');
    expect(host.classList).not.toContain('is-revealed');
    expect(children.map((child) => child.style.getPropertyValue('--reveal-i'))).toEqual(['0', '1']);
    expect(observer.observed.has(host)).toBe(true);

    observer.intersect(host);

    expect(host.classList).toContain('is-revealed');
    expect(observer.observed.has(host)).toBe(false);
  });

  it.each([
    ['right', 'motion-safe:*:translate-x-6', 'motion-safe:*:-translate-x-6'],
    ['left', 'motion-safe:*:-translate-x-6', 'motion-safe:*:translate-x-6'],
    ['', 'motion-safe:*:-translate-x-6', 'motion-safe:*:translate-x-6'],
  ] as [RevealDirection | '', string, string][])('slides in from the %p side', async (direction, applied, other) => {
    const host = await render(direction);

    expect(host.classList).toContain(applied);
    expect(host.classList).not.toContain(other);
  });

  it('shows children instantly, with no transition, while focus is inside', async () => {
    const host = await render();

    expect(host.classList).toContain('focus-within:*:opacity-100');
    expect(host.classList).toContain('focus-within:*:translate-x-0');
    expect(host.classList).toContain('focus-within:*:transition-none');
  });

  it('reveals for good on the first focus, before the host scrolls into view', async () => {
    const host = await render();
    const observer = RecordingObserver.instance as RecordingObserver;

    host.querySelector('p')?.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

    expect(host.classList).toContain('is-revealed');
    expect(observer.observed.has(host)).toBe(false);
  });

  it('leaves content alone when the user prefers reduced motion', async () => {
    window.matchMedia = ((query: string) => ({ matches: query.includes('reduce'), media: query }) as MediaQueryList) as typeof window.matchMedia;

    const host = await render();

    expect(host.classList).not.toContain('motion-safe:*:opacity-0');
  });

  it('leaves content alone without IntersectionObserver', async () => {
    delete (window as Partial<typeof window>).IntersectionObserver;

    const host = await render();

    expect(host.classList).not.toContain('motion-safe:*:opacity-0');
  });

  describe('on a container', () => {
    it('keeps the reveal classes when the container width changes', async () => {
      const fixture = TestBed.createComponent(ContainerHostComponent);
      await fixture.whenStable();

      const host: HTMLElement = fixture.nativeElement.querySelector('div');
      RecordingObserver.instance?.intersect(host);

      fixture.componentRef.setInput('width', 'narrow');
      await fixture.whenStable();

      expect(host.classList).toContain('max-w-3xl');
      expect(host.classList).not.toContain('max-w-7xl');
      expect(host.classList).toContain('motion-safe:*:opacity-0');
      expect(host.classList).toContain('motion-safe:*:translate-x-6');
      expect(host.classList).toContain('is-revealed');
    });

    it('has no axe violations while the content is still hidden', async () => {
      const fixture = TestBed.createComponent(ContainerHostComponent);
      await fixture.whenStable();

      expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });
  });
});
