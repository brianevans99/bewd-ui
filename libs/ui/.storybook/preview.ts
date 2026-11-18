import './styles.css';

// Angular CLI builds define ngServerMode; Storybook's webpack build does not. Production Angular code reads it
// unguarded (`ngDevMode || ngServerMode`), so a production Storybook throws ReferenceError without this.
(globalThis as { ngServerMode?: boolean }).ngServerMode ??= false;

import type { Preview } from '@storybook/angular';

const preview: Preview = {
  parameters: {},
};

export default preview;
