import type { AriaAttributes, HTMLAttributes } from 'vue';

export type HTMLAriaDataAttributes = AriaAttributes & {
  [key: `data-${string}`]: unknown;
} & Pick<HTMLAttributes, 'role'>;
