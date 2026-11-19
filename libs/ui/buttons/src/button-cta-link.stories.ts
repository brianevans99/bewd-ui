import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonCtaLinkComponent } from './button-cta-link';

type ButtonCtaLinkStoryArgs = ButtonCtaLinkComponent & { label: string; href: string };

const meta: Meta<ButtonCtaLinkStoryArgs> = {
  title: 'Atoms/Buttons/Button CTA Link',
  component: ButtonCtaLinkComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `
      <a be-button-cta [href]="href" [variant]="variant" [size]="size" [fit]="fit">
        {{ label }}
      </a>
    `,
  }),
  args: {
    href: '#contact',
    size: 'base',
    fit: false,
  },
  argTypes: {
    href: {
      control: 'text',
      description: 'Native `href`. `routerLink` works too.',
    },
    fit: {
      control: 'select',
      options: [false, true, 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'The link fills its parent by default. `fit` shrinks it to its content at every width; a breakpoint shrinks it from that breakpoint up.',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'base', 'lg', 'xl'],
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
          'A link styled as the call-to-action button, for CTAs that navigate rather than act. Apply it to a native anchor: `<a be-button-cta href="…">`, so screen readers announce a link and middle-click, `target` and `routerLink` work as usual.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<ButtonCtaLinkStoryArgs>;

export const Default: Story = {
  args: {
    variant: 'default',
    label: 'Contact us',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    label: 'See pricing',
  },
};

export const Pair: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-3 sm:flex-row">
        <a be-button-cta href="#contact" fit="sm">Contact us</a>
        <a be-button-cta href="#pricing" variant="tertiary" fit="sm">See pricing</a>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'A primary and secondary CTA side by side: stacked full width on phones, fitted to their content from `sm` up.',
      },
    },
  },
};
