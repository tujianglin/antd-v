import type { VariantProps } from 'class-variance-authority';
import type { HTMLAttributes, VNode } from 'vue';
import type { buttonVariants } from './buttonHelpers';

type ButtonVariants = VariantProps<typeof buttonVariants>;

export type ButtonProps = {
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
  class?: HTMLAttributes['class'];
  loading?: boolean;
  ghost?: boolean;
  danger?: boolean;
  icon?: VNode;
};
