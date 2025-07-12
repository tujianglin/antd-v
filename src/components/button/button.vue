<script setup lang="tsx">
import { Icon } from '@iconify/vue';
import { Primitive, type PrimitiveProps } from 'reka-ui';
import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, type HTMLAttributes } from 'vue';
import type { ButtonProps } from './interface';
import { cn } from '@/utils/cn';
import { buttonVariants } from './buttonHelpers';

type MergedHTMLAttributes = Omit<HTMLAttributes & ButtonHTMLAttributes & AnchorHTMLAttributes, 'type'>;

interface Props extends PrimitiveProps, ButtonProps, /** @vue-ignore */ MergedHTMLAttributes {}

const { as = 'button', variant = 'default', size, class: className, loading, icon } = defineProps<Props>();

const IconNode = () => {
  return (
    <span class="box-border">
      <span class="inline-flex size-[14px] items-center text-center align-[-0.2em] leading-0 text-inherit">
        {loading ? <Icon icon="line-md:loading-loop"></Icon> : icon ? <>{icon}</> : null}
      </span>
    </span>
  );
};
</script>

<template>
  <Primitive
    data-slot="button"
    :as="as"
    :as-child="asChild"
    :class="
      cn(
        buttonVariants({ variant, size }),
        'hover:opacity-80',
        {
          'text-primary bg-transparent hover:bg-transparent': ghost,
          'bg-destructive border-destructive hover:border-destructive hover:bg-destructive': danger && variant === 'primary',
          'text-destructive bg-transparent hover:bg-transparent': danger && ghost,
          'text-destructive border-destructive hover:border-destructive hover:text-destructive': danger && variant !== 'primary',
        },
        className,
      )
    "
    :disabled="$attrs?.disabled || loading"
  >
    <IconNode v-if="loading || icon" />
    <slot></slot>
  </Primitive>
</template>
