import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonCtaComponent } from './button-cta';

const meta: Meta<ButtonCtaComponent> = {
  title: 'Atoms/Buttons/Button CTA',
  component: ButtonCtaComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'info', 'warning', 'danger'],
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'A call-to-action button that comes in various styles, used for the most important actions.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<ButtonCtaComponent>;

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
  parameters: {
    docs: {
      description: {
        story: 'The primary call-to-action button, used for the most important actions.',
      },
    },
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
  },
};
