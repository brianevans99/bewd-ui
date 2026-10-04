import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonCtaComponent } from './button-cta';

describe('ButtonCtaComponent', () => {
  let fixture: ComponentFixture<ButtonCtaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonCtaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonCtaComponent);
    fixture.detectChanges();
  });

  it('renders a primary button by default', () => {
    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');

    expect(button.textContent).toContain('Primary');
    expect(button.className).toContain('bg-primary');
    expect(button.className).toContain('text-type-reverse');
  });

  it('applies the selected variant classes', () => {
    fixture.componentRef.setInput('variant', 'danger');
    fixture.detectChanges();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');

    expect(button.textContent).toContain('Danger');
    expect(button.className).toContain('bg-danger');
    expect(button.className).toContain('hover:bg-danger-hover');
  });
});
