import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'be-button-cta',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <button type="button" [class]="buttonClasses">
      {{ variant | titlecase }}
    </button>
  `,
})
export class ButtonCtaComponent {
  @Input() variant:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warning'
    | 'danger' = 'primary';

  public get buttonClasses(): string {
    const baseClasses =
      'cursor-pointer w-full box-border border border-transparent shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-offset-5 focus:ring-4 rounded';

    const variantClasses = {
      primary:
        'text-type-reverse bg-primary hover:bg-primary-hover focus:ring-primary',
      secondary:
        'text-type bg-neutral hover:bg-neutral-hover focus:ring-neutral',
      success:
        'text-type-reverse bg-success hover:bg-success-hover focus:ring-success',
      info: 'text-type bg-info hover:bg-info-hover focus:ring-info',
      warning: 'text-type bg-warning hover:bg-warning-hover focus:ring-warning',
      danger:
        'text-type-reverse bg-danger hover:bg-danger-hover focus:ring-danger',
    };

    return `${baseClasses} ${variantClasses[this.variant]}`;
  }
}
