import type { Meta, StoryObj } from '@storybook/angular';
import { HeadingComponent } from './heading';

type HeadingStoryArgs = HeadingComponent & { label: string };

const meta: Meta<HeadingStoryArgs> = {
  title: 'Atoms/Typography/Heading',
  component: HeadingComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<h2 be-heading [size]="size">{{ label }}</h2>`,
  }),
  args: {
    label: 'Account settings',
  },
  argTypes: {
    size: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6],
      description: 'Changes the look only. The tag sets the level, so `<h2 be-heading [size]="4">` is still an h2. Reset the control to go back to the tag\'s own look.',
    },
    label: {
      control: 'text',
      description: 'Projected content.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Consistent heading styles for h1–h6. Apply it to a native heading: `<h2 be-heading>`, which gets the h2 look. Choose the tag for the page structure, never for its size, and use `size` when the design needs a different look.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<HeadingStoryArgs>;

export const Default: Story = {};

export const AllLevels: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-4">
        <h1 be-heading>Heading 1</h1>
        <h2 be-heading>Heading 2</h2>
        <h3 be-heading>Heading 3</h3>
        <h4 be-heading>Heading 4</h4>
        <h5 be-heading>Heading 5</h5>
        <h6 be-heading>Heading 6</h6>
      </div>
    `,
  }),
  // Each heading shows its own level's look, so there's nothing for the controls to change.
  parameters: {
    controls: { disable: true },
  },
};

export const SizeOverride: Story = {
  args: {
    size: 4,
    label: 'An h2 that looks like an h4',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use `size` when the structure needs one level but the design shows another. Screen readers still announce the tag\'s level.',
      },
    },
  },
};
