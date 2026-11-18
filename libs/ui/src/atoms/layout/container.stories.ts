import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { RevealDirective, type RevealDirection } from '../../directives/reveal';
import { HeadingComponent } from '../typography/heading';
import { ContainerComponent } from './container';

type ContainerStoryArgs = ContainerComponent & { reveal: RevealDirection };

const meta: Meta<ContainerStoryArgs> = {
  title: 'Atoms/Layout/Container',
  component: ContainerComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [HeadingComponent, RevealDirective] })],
  render: (args) => ({
    props: args,
    template: `
      <section aria-labelledby="container-title">
        <div be-container [width]="width" class="border border-dashed border-default">
          <h2 be-heading id="container-title">Your direct development partner</h2>
          <p class="mt-4 text-body">The container sets the section's padding and maximum width. The dashed border shows its edges.</p>
        </div>
      </section>
    `,
  }),
  args: {
    width: 'wide',
  },
  argTypes: {
    width: {
      control: 'select',
      options: ['narrow', 'wide'],
      description: '`wide` (the default) for grids and multi-column content, `narrow` for reading text and forms.',
    },
    reveal: {
      table: { disable: true },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Consistent padding and maximum width for page sections. Apply it to the div inside a section: `<section aria-labelledby="…"><div be-container>`. Put the background and the section\'s name on the `<section>`, so the background runs full width and the section is announced as a landmark.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<ContainerStoryArgs>;

export const Default: Story = {};

export const Narrow: Story = {
  args: {
    width: 'narrow',
  },
};

export const WithBackground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <section aria-labelledby="background-title" class="bg-neutral-secondary-medium">
        <div be-container [width]="width">
          <h2 be-heading id="background-title">Get started today</h2>
          <p class="mt-4 text-body">The background is on the section, so it runs full width while the content stays inside the container.</p>
        </div>
      </section>
    `,
  }),
};

export const WithReveal: Story = {
  args: {
    reveal: 'right',
  },
  argTypes: {
    reveal: {
      table: { disable: false },
      control: 'select',
      options: ['left', 'right'],
      description: 'The `beReveal` direction. Children slide in from this side, 80ms apart, the first time the section scrolls into view.',
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <p class="text-body">Scroll down to reveal the section.</p>
      <div class="h-[120vh]" aria-hidden="true"></div>
      <section aria-labelledby="reveal-title">
        <div be-container [width]="width" [beReveal]="reveal">
          <h2 be-heading id="reveal-title">From idea to launch</h2>
          <p class="mt-4 text-body">Each child fades in after the one before it.</p>
          <p class="mt-4 text-body">Users who prefer reduced motion see the content straight away.</p>
        </div>
      </section>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Add `beReveal` to the container, or to any element, to slide its children in once. Content is only hidden after the observer is in place, and it shows as soon as keyboard focus moves into it.',
      },
    },
  },
};
