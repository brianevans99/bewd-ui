import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, RouterLink } from '@angular/router';
import { axe } from '../../src/testing/axe';
import { ButtonCtaBreakpoint, ButtonCtaFit, ButtonCtaSize, ButtonCtaVariant } from './button-cta-base';
import { ButtonCtaLinkComponent } from './button-cta-link';

@Component({
  imports: [ButtonCtaLinkComponent],
  template: `
    <a be-button-cta href="#contact" [variant]="variant()" [size]="size()" [fit]="fit()">
      Contact us
    </a>
  `,
})
class LinkHostComponent {
  readonly variant = input<ButtonCtaVariant>('default');
  readonly size = input<ButtonCtaSize>('base');
  readonly fit = input<ButtonCtaFit | ''>(false);
}

@Component({
  imports: [ButtonCtaLinkComponent],
  template: `
    <a be-button-cta id="docs" class="sm:w-fit" href="https://example.com" target="_blank" rel="noopener" aria-describedby="hint">
      <svg data-testid="icon"></svg>
      Docs
    </a>
  `,
})
class AttributesHostComponent {}

@Component({
  imports: [ButtonCtaLinkComponent, RouterLink],
  template: `<a be-button-cta routerLink="/pricing">Pricing</a>`,
})
class RouterLinkHostComponent {}

@Component({
  imports: [ButtonCtaLinkComponent],
  template: `
    <a be-button-cta href="/download" [attr.aria-label]="label()">
      <svg aria-hidden="true"></svg>
    </a>
  `,
})
class IconOnlyHostComponent {
  readonly label = input<string>();
}

const variants: ButtonCtaVariant[] = ['default', 'secondary', 'tertiary', 'success', 'danger', 'warning', 'dark', 'ghost'];

// Angular sorts the class list, so check each class rather than a substring.
function expectClasses(element: HTMLElement, classes: string): void {
  for (const className of classes.split(' ')) {
    expect(element.classList).toContain(className);
  }
}

// Jest's jsdom has no PointerEvent; the handlers only read MouseEvent fields plus pointerType.
function pointerEvent(type: string, init: MouseEventInit & { pointerType?: string } = {}): MouseEvent {
  const event = new MouseEvent(type, { button: 0, ...init });
  Object.defineProperty(event, 'pointerType', { value: init.pointerType ?? 'mouse' });
  return event;
}

describe('ButtonCtaLinkComponent', () => {
  let fixture: ComponentFixture<LinkHostComponent>;
  let link: HTMLAnchorElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkHostComponent, AttributesHostComponent, RouterLinkHostComponent, IconOnlyHostComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LinkHostComponent);
    fixture.detectChanges();
    link = fixture.nativeElement.querySelector('a');
  });

  it('renders the component on the native anchor element', () => {
    expect(link.textContent).toContain('Contact us');
    expect(link.getAttribute('href')).toBe('#contact');
    expect(link.className).toContain('bg-brand');
  });

  it('looks like the default CTA button by default', () => {
    expectClasses(link, 'bg-brand text-white rounded-base text-sm px-4 py-2.5 w-full justify-center');
  });

  it('applies the selected variant classes', () => {
    fixture.componentRef.setInput('variant', 'secondary');
    fixture.detectChanges();

    expectClasses(link, 'bg-neutral-secondary-medium hover:bg-neutral-tertiary-medium');
    expect(link.classList).not.toContain('bg-brand');
  });

  it('applies the selected size classes', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    expectClasses(link, 'text-base px-5 py-3');
  });

  it('shrinks to its content with fit, including from a bare attribute', () => {
    fixture.componentRef.setInput('fit', '');
    fixture.detectChanges();

    expect(link.classList).toContain('w-fit');
    expect(link.classList).not.toContain('w-full');
  });

  it('fits at every width with fit="true"', () => {
    fixture.componentRef.setInput('fit', true);
    fixture.detectChanges();

    expect(link.classList).toContain('w-fit');
    expect(link.classList).not.toContain('w-full');
  });

  it.each<[ButtonCtaBreakpoint, string]>([
    ['sm', 'sm:w-fit'],
    ['md', 'md:w-fit'],
    ['lg', 'lg:w-fit'],
    ['xl', 'xl:w-fit'],
    ['2xl', '2xl:w-fit'],
  ])('with fit="%s", fills its parent and adds %s', (breakpoint, fitClass) => {
    fixture.componentRef.setInput('fit', breakpoint);
    fixture.detectChanges();

    expectClasses(link, `w-full ${fitClass}`);
    expect(link.classList).not.toContain('w-fit');
  });

  it('does not set button-only attributes on the link', () => {
    expect(link.hasAttribute('type')).toBe(false);
    expect(link.hasAttribute('disabled')).toBe(false);
    expect(link.hasAttribute('aria-busy')).toBe(false);
  });

  it('keeps native attributes, consumer classes and projected content', () => {
    const hostFixture = TestBed.createComponent(AttributesHostComponent);
    hostFixture.detectChanges();

    const hostLink: HTMLAnchorElement = hostFixture.nativeElement.querySelector('a');

    expect(hostLink.id).toBe('docs');
    expect(hostLink.target).toBe('_blank');
    expect(hostLink.rel).toBe('noopener');
    expect(hostLink.getAttribute('aria-describedby')).toBe('hint');
    expect(hostLink.classList).toContain('sm:w-fit');
    expect(hostLink.classList).toContain('bg-brand');
    expect(hostLink.querySelector('[data-testid="icon"]')).not.toBeNull();
  });

  it('works with routerLink', () => {
    const hostFixture = TestBed.createComponent(RouterLinkHostComponent);
    hostFixture.detectChanges();

    const hostLink: HTMLAnchorElement = hostFixture.nativeElement.querySelector('a');

    expect(hostLink.getAttribute('href')).toBe('/pricing');
    expect(hostLink.classList).toContain('bg-brand');
  });

  describe('ripple', () => {
    const getRipples = (): NodeListOf<HTMLElement> => link.querySelectorAll('.ripple');

    it('adds a hidden ripple on pointerdown and removes it when the animation ends', () => {
      link.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, clientY: 10 }));
      fixture.detectChanges();

      expect(getRipples()).toHaveLength(1);
      expect(getRipples()[0].getAttribute('aria-hidden')).toBe('true');

      getRipples()[0].dispatchEvent(new Event('animationend'));
      fixture.detectChanges();

      expect(getRipples()).toHaveLength(0);
    });

    it('adds a ripple when Enter activates the link', () => {
      link.dispatchEvent(new MouseEvent('click', { detail: 0 }));
      fixture.detectChanges();

      expect(getRipples()).toHaveLength(1);
    });
  });

  describe('accessibility', () => {
    it.each(variants)('has no violations for the %s variant', async (variant) => {
      fixture.componentRef.setInput('variant', variant);
      fixture.detectChanges();

      expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });

    it('has no violations for an icon-only link with aria-label', async () => {
      const hostFixture = TestBed.createComponent(IconOnlyHostComponent);
      hostFixture.componentRef.setInput('label', 'Download');
      hostFixture.detectChanges();

      expect(await axe(hostFixture.nativeElement)).toHaveNoViolations();
    });

    it('reports a missing name for an icon-only link without aria-label', async () => {
      const hostFixture = TestBed.createComponent(IconOnlyHostComponent);
      hostFixture.detectChanges();

      const results = await axe(hostFixture.nativeElement);

      expect(results.violations.map((v) => v.id)).toContain('link-name');
    });
  });
});
