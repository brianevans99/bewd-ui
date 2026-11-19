import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { axe } from '../../src/testing/axe';
import { ButtonCtaComponent, ButtonCtaSize, ButtonCtaType, ButtonCtaVariant } from './button-cta';

@Component({
  imports: [ButtonCtaComponent],
  template: `
    <button be-button-cta id="save" class="w-full" aria-expanded="true" aria-controls="menu">
      <svg data-testid="icon"></svg>
      Save changes
    </button>
  `,
})
class HostComponent {}

@Component({
  imports: [ButtonCtaComponent],
  template: `
    <button be-button-cta [variant]="variant()" [size]="size()" [type]="type()" [disabled]="disabled()" [loading]="loading()" [fit]="fit()">
      Save changes
    </button>
  `,
})
class TextHostComponent {
  readonly variant = input<ButtonCtaVariant>('default');
  readonly size = input<ButtonCtaSize>('base');
  readonly type = input<ButtonCtaType>('button');
  readonly disabled = input<boolean | string>(false);
  readonly loading = input(false);
  readonly fit = input<boolean | string>(false);
}

@Component({
  imports: [ButtonCtaComponent],
  template: `
    <button be-button-cta [attr.aria-label]="label()">
      <svg aria-hidden="true"></svg>
    </button>
  `,
})
class IconOnlyHostComponent {
  readonly label = input<string>();
}

@Component({
  imports: [ButtonCtaComponent],
  template: `
    <form (submit)="submits = submits + 1; $event.preventDefault()">
      <button be-button-cta type="submit" [loading]="loading()" (click)="clicks = clicks + 1">Save</button>
    </form>
  `,
})
class FormHostComponent {
  readonly loading = input(false);
  clicks = 0;
  submits = 0;
}

const variants: ButtonCtaVariant[] = ['default', 'secondary', 'tertiary', 'success', 'danger', 'warning', 'dark', 'ghost'];

const sizes: [ButtonCtaSize, string][] = [
  ['xs', 'text-xs px-3 py-1.5'],
  ['sm', 'text-sm px-3 py-2'],
  ['base', 'text-sm px-4 py-2.5'],
  ['lg', 'text-base px-5 py-3'],
  ['xl', 'text-base px-6 py-3.5'],
];

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

describe('ButtonCtaComponent', () => {
  let fixture: ComponentFixture<TextHostComponent>;
  let button: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonCtaComponent, HostComponent, TextHostComponent, IconOnlyHostComponent, FormHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TextHostComponent);
    fixture.detectChanges();
    button = fixture.nativeElement.querySelector('button');
  });

  it('renders the component on the native button element', () => {
    // The attribute selector makes the native button the component's host, so its template renders inside it.
    expect(button.textContent).toContain('Save changes');
    expect(button.className).toContain('bg-brand');
  });

  it('renders a default button by default', () => {
    expect(button.className).toContain('bg-brand');
    expect(button.className).toContain('text-white');
  });

  it('applies the base classes', () => {
    expect(button.className).toContain('rounded-base');
    expect(button.className).toContain('focus-visible:outline-4');
    expect(button.className).toContain('focus-visible:outline-offset-1');
  });

  it('applies the selected variant classes', () => {
    fixture.componentRef.setInput('variant', 'danger');
    fixture.detectChanges();

    expect(button.className).toContain('bg-danger');
    expect(button.className).toContain('hover:bg-danger-strong');
  });

  it('defaults to the base size', () => {
    const hostFixture = TestBed.createComponent(HostComponent);
    hostFixture.detectChanges();

    expectClasses(hostFixture.nativeElement.querySelector('button'), 'text-sm px-4 py-2.5 leading-5');
  });

  it.each(sizes)('applies the %s size classes', (size, classes) => {
    fixture.componentRef.setInput('size', size);
    fixture.detectChanges();

    expectClasses(button, classes);
  });

  it('fills its parent by default with centred content', () => {
    expectClasses(button, 'w-full justify-center');
    expect(button.classList).not.toContain('w-fit');
  });

  it('shrinks to its content with fit, including from a bare attribute', () => {
    fixture.componentRef.setInput('fit', '');
    fixture.detectChanges();

    expect(button.classList).toContain('w-fit');
    expect(button.classList).not.toContain('w-full');
  });

  it('defaults to type="button" so it does not submit forms', () => {
    const hostFixture = TestBed.createComponent(HostComponent);
    hostFixture.detectChanges();

    expect(hostFixture.nativeElement.querySelector('button').type).toBe('button');
  });

  it('applies the selected type', () => {
    fixture.componentRef.setInput('type', 'submit');
    fixture.detectChanges();

    expect(button.type).toBe('submit');
  });

  it('is enabled by default', () => {
    expect(button.disabled).toBe(false);
  });

  it('disables the native button, including from a bare attribute', () => {
    // A bare `disabled` attribute passes an empty string, which booleanAttribute turns into true.
    fixture.componentRef.setInput('disabled', '');
    fixture.detectChanges();

    expect(button.disabled).toBe(true);
  });

  it('projects text and icon content into the button', () => {
    const hostFixture = TestBed.createComponent(HostComponent);
    hostFixture.detectChanges();

    const hostButton: HTMLButtonElement = hostFixture.nativeElement.querySelector('button');

    expect(hostButton.textContent).toContain('Save changes');
    expect(hostButton.querySelector('[data-testid="icon"]')).not.toBeNull();
  });

  it('keeps native attributes and consumer classes set on the button', () => {
    const hostFixture = TestBed.createComponent(HostComponent);
    hostFixture.detectChanges();

    const hostButton: HTMLButtonElement = hostFixture.nativeElement.querySelector('button');

    expect(hostButton.id).toBe('save');
    expect(hostButton.getAttribute('aria-expanded')).toBe('true');
    expect(hostButton.getAttribute('aria-controls')).toBe('menu');
    expect(hostButton.className).toContain('w-full');
    expect(hostButton.className).toContain('bg-brand');
  });

  describe('loading', () => {
    it('is not busy by default', () => {
      expect(button.hasAttribute('aria-busy')).toBe(false);
      expect(button.hasAttribute('aria-disabled')).toBe(false);
    });

    it('marks the button busy but keeps it focusable', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      expect(button.getAttribute('aria-busy')).toBe('true');
      expect(button.getAttribute('aria-disabled')).toBe('true');
      expect(button.disabled).toBe(false);
      expect(button.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    });

    it('lets clicks and form submits through when not loading', () => {
      const formFixture = TestBed.createComponent(FormHostComponent);
      formFixture.detectChanges();

      formFixture.nativeElement.querySelector('button').click();

      expect(formFixture.componentInstance.clicks).toBe(1);
      expect(formFixture.componentInstance.submits).toBe(1);
    });

    it('blocks the consumer click handler and form submit while loading', () => {
      const formFixture = TestBed.createComponent(FormHostComponent);
      formFixture.componentRef.setInput('loading', true);
      formFixture.detectChanges();

      formFixture.nativeElement.querySelector('button').click();

      expect(formFixture.componentInstance.clicks).toBe(0);
      expect(formFixture.componentInstance.submits).toBe(0);
    });
  });

  describe('ripple', () => {
    const getRipples = (): NodeListOf<HTMLElement> => button.querySelectorAll('.ripple');

    afterEach(() => {
      delete (window as { matchMedia?: unknown }).matchMedia;
    });

    it('adds a hidden ripple on pointerdown and removes it when the animation ends', () => {
      button.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, clientY: 10 }));
      fixture.detectChanges();

      expect(getRipples()).toHaveLength(1);
      expect(getRipples()[0].getAttribute('aria-hidden')).toBe('true');

      getRipples()[0].dispatchEvent(new Event('animationend'));
      fixture.detectChanges();

      expect(getRipples()).toHaveLength(0);
    });

    it('ignores non-primary pointer buttons', () => {
      button.dispatchEvent(pointerEvent('pointerdown', { button: 2 }));
      fixture.detectChanges();

      expect(getRipples()).toHaveLength(0);
    });

    it('waits for pointerup on touch, so a scroll does not ripple', () => {
      button.dispatchEvent(pointerEvent('pointerdown', { pointerType: 'touch' }));
      fixture.detectChanges();

      expect(getRipples()).toHaveLength(0);

      button.dispatchEvent(pointerEvent('pointerup', { pointerType: 'touch' }));
      fixture.detectChanges();

      expect(getRipples()).toHaveLength(1);
    });

    it('does not ripple when a touch is cancelled by scrolling', () => {
      button.dispatchEvent(pointerEvent('pointerdown', { pointerType: 'touch' }));
      button.dispatchEvent(pointerEvent('pointercancel', { pointerType: 'touch' }));
      button.dispatchEvent(pointerEvent('pointerup', { pointerType: 'touch' }));
      fixture.detectChanges();

      expect(getRipples()).toHaveLength(0);
    });

    it('adds a ripple on keyboard activation', () => {
      button.dispatchEvent(new MouseEvent('click', { detail: 0 }));
      fixture.detectChanges();

      expect(getRipples()).toHaveLength(1);
    });

    it('does not ripple on a mouse click, since pointerdown already did', () => {
      button.dispatchEvent(new MouseEvent('click', { detail: 1 }));
      fixture.detectChanges();

      expect(getRipples()).toHaveLength(0);
    });

    it('does not ripple when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      button.dispatchEvent(pointerEvent('pointerdown'));
      button.dispatchEvent(new MouseEvent('click', { detail: 0 }));
      fixture.detectChanges();

      expect(getRipples()).toHaveLength(0);
    });

    it('does not ripple while loading', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      button.dispatchEvent(pointerEvent('pointerdown'));
      button.dispatchEvent(new MouseEvent('click', { detail: 0 }));
      fixture.detectChanges();

      expect(getRipples()).toHaveLength(0);
    });

    it('fades instead of growing when reduced motion is preferred', () => {
      window.matchMedia = ((query: string) => ({ matches: query === '(prefers-reduced-motion: reduce)' })) as typeof window.matchMedia;

      button.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, clientY: 10 }));
      fixture.detectChanges();

      const ripple = getRipples()[0];
      expect(ripple.classList).toContain('ripple-fade');
      expect(ripple.style.width).toBe('');
    });

    it('has no axe violations while a ripple is showing', async () => {
      const hostFixture = TestBed.createComponent(TextHostComponent);
      hostFixture.detectChanges();

      hostFixture.nativeElement.querySelector('button').dispatchEvent(pointerEvent('pointerdown'));
      hostFixture.detectChanges();

      expect(hostFixture.nativeElement.querySelectorAll('.ripple')).toHaveLength(1);
      expect(await axe(hostFixture.nativeElement)).toHaveNoViolations();
    });
  });

  describe('accessibility', () => {
    it.each(variants)('has no violations for the %s variant', async (variant) => {
      const hostFixture = TestBed.createComponent(TextHostComponent);
      hostFixture.componentRef.setInput('variant', variant);
      hostFixture.detectChanges();

      expect(await axe(hostFixture.nativeElement)).toHaveNoViolations();
    });

    it('has no violations when disabled', async () => {
      const hostFixture = TestBed.createComponent(TextHostComponent);
      hostFixture.componentRef.setInput('disabled', true);
      hostFixture.detectChanges();

      expect(await axe(hostFixture.nativeElement)).toHaveNoViolations();
    });

    it('has no violations while loading', async () => {
      const hostFixture = TestBed.createComponent(TextHostComponent);
      hostFixture.componentRef.setInput('loading', true);
      hostFixture.detectChanges();

      expect(await axe(hostFixture.nativeElement)).toHaveNoViolations();
    });

    it('has no violations for an icon-only button with aria-label', async () => {
      const hostFixture = TestBed.createComponent(IconOnlyHostComponent);
      hostFixture.componentRef.setInput('label', 'Download');
      hostFixture.detectChanges();

      expect(await axe(hostFixture.nativeElement)).toHaveNoViolations();
    });

    it('reports a missing name for an icon-only button without aria-label', async () => {
      const hostFixture = TestBed.createComponent(IconOnlyHostComponent);
      hostFixture.detectChanges();

      const results = await axe(hostFixture.nativeElement);

      expect(results.violations.map((v) => v.id)).toContain('button-name');
    });
  });
});
