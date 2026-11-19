import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonCtaComponent } from './button-cta';

type ButtonCtaStoryArgs = ButtonCtaComponent & { label: string; ariaLabel?: string };

const meta: Meta<ButtonCtaStoryArgs> = {
  title: 'Atoms/Buttons/Button CTA',
  component: ButtonCtaComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `
      <button be-button-cta [variant]="variant" [size]="size" [type]="type" [disabled]="disabled" [loading]="loading" [fit]="fit" [attr.aria-label]="ariaLabel">
        {{ label }}
      </button>
    `,
  }),
  args: {
    size: 'base',
    type: 'button',
    disabled: false,
    loading: false,
    fit: false,
  },
  argTypes: {
    fit: {
      control: 'select',
      options: [false, true, 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'The button fills its parent by default. `fit` shrinks it to its content at every width; a breakpoint shrinks it from that breakpoint up.',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'base', 'lg', 'xl'],
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      description: 'Native button type. Defaults to `button` so it never submits a form by accident.',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the native button: it is skipped by Tab and announced as unavailable.',
    },
    loading: {
      control: 'boolean',
      description: 'Shows a spinner and sets `aria-busy`. The button stays focusable but ignores clicks and form submits.',
    },
    ariaLabel: {
      control: 'text',
      description: 'Native `aria-label`. Required when the button contains only an icon.',
    },
    label: {
      control: 'text',
      description: 'Projected content. Pass text, an icon, or both.',
    },
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'tertiary', 'success', 'danger', 'warning', 'dark', 'ghost'],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A call-to-action button that comes in various styles, used for the most important actions. Apply it to a native button: `<button be-button-cta>`, so ARIA, id and form attributes work as usual.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<ButtonCtaStoryArgs>;

export const Default: Story = {
  args: {
    variant: 'default',
    label: 'Default',
  },
  parameters: {
    docs: {
      description: {
        story:
          'The default call-to-action button, used for the most important actions.',
      },
    },
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    label: 'Secondary',
  },
};

export const Tertiary: Story = {
  args: {
    variant: 'tertiary',
    label: 'Tertiary',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    label: 'Success',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    label: 'Danger',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    label: 'Warning',
  },
};

export const Dark: Story = {
  args: {
    variant: 'dark',
    label: 'Dark',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    label: 'Ghost',
  },
};

export const Sizes: Story = {
  args: {
    variant: 'default',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <button be-button-cta [variant]="variant" size="xs" fit>Extra small</button>
        <button be-button-cta [variant]="variant" size="sm" fit>Small</button>
        <button be-button-cta [variant]="variant" size="base" fit>Base</button>
        <button be-button-cta [variant]="variant" size="lg" fit>Large</button>
        <button be-button-cta [variant]="variant" size="xl" fit>Extra large</button>
      </div>
    `,
  }),
};

export const FitContent: Story = {
  args: {
    variant: 'default',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="flex flex-col gap-3">
        <button be-button-cta [variant]="variant">Fills its parent (default)</button>
        <button be-button-cta [variant]="variant" fit>Fits its content</button>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Use `fit` for icon-only buttons and buttons in toolbars or other rows, where full-width buttons would share the row equally.',
      },
    },
  },
};

export const ResponsiveWidth: Story = {
  args: {
    variant: 'default',
    label: 'Full width on phones, fits content from sm up',
  },
  render: (args) => ({
    props: args,
    template: `<button be-button-cta [variant]="variant" fit="sm">{{ label }}</button>`,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Pass a breakpoint to `fit`, such as `fit="sm"`: the button fills its parent below that breakpoint and fits its content from it up.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    variant: 'default',
    label: 'Disabled',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    variant: 'default',
    label: 'Saving',
    loading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'While loading, the label stays for screen readers, `aria-busy` is set, and clicks and form submits are ignored.',
      },
    },
  },
};

export const WithIcon: Story = {
  args: {
    variant: 'default',
    label: 'Download',
  },
  render: (args) => ({
    props: args,
    template: `
      <button be-button-cta [variant]="variant" [size]="size">
        <svg class="size-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v12m0 0-4-4m4 4 4-4M5 20h14" />
        </svg>
        {{ label }}
      </button>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Any element can be projected alongside the label, such as an inline SVG or an icon component.',
      },
    },
  },
};

export const IconOnly: Story = {
  args: {
    variant: 'default',
    ariaLabel: 'Download',
  },
  render: (args) => ({
    props: args,
    template: `
      <button be-button-cta [variant]="variant" [size]="size" [attr.aria-label]="ariaLabel" fit>
        <svg class="size-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v12m0 0-4-4m4 4 4-4M5 20h14" />
        </svg>
      </button>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'An icon-only button. Set the native `aria-label` so screen readers have a name to announce.',
      },
    },
  },
};
