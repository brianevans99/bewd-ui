// .storybook/preview.ts
import '../src/styles.css'; // Adjust this path if your styles.css lives elsewhere

import type { Preview } from '@storybook/angular';

const preview: Preview = {
    parameters: {
        // your existing parameters (like backgrounds, actions, etc.)
    },
};

export default preview;