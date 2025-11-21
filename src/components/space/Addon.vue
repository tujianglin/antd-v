<script lang="tsx" setup>
import { clsx } from 'clsx';

import { computed, toRefs, type CSSProperties, type HTMLAttributes } from 'vue';
import type { InputStatus } from '../_util/statusUtils';
import { getStatusClassNames } from '../_util/statusUtils';
import { useConfigContextInject, type Variant } from '../config-provider';
import { useCompactItemContext } from './CompactContext';
import useStyle from './style/addon';

export interface SpaceCompactCellProps extends /** @vue-ignore */ HTMLAttributes {
  class?: string;
  style?: CSSProperties;
  prefixCls?: string;
  variant?: Variant;
  disabled?: boolean;
  status?: InputStatus;
}

const {
  class: className,
  style,
  prefixCls: customizePrefixCls,
  variant = 'outlined',
  disabled,
  status,
  ...restProps
} = defineProps<SpaceCompactCellProps>();
const { getPrefixCls, direction: directionConfig } = toRefs(useConfigContextInject());

const prefixCls = computed(() => getPrefixCls.value('space-addon', customizePrefixCls));
const [hashId, cssVarCls] = useStyle(prefixCls);
const { compactItemClassnames, compactSize } = useCompactItemContext(prefixCls, directionConfig);

const statusCls = computed(() => getStatusClassNames(prefixCls.value, status));

const classes = clsx(
  prefixCls.value,
  hashId.value,
  compactItemClassnames?.value,
  cssVarCls.value,
  `${prefixCls.value}-variant-${variant}`,
  statusCls,
  {
    [`${prefixCls.value}-${compactSize?.value}`]: compactSize?.value,
    [`${prefixCls.value}-disabled`]: disabled,
  },
  className,
);
</script>
<template>
  <div :class="classes" :style="style" v-bind="restProps">
    <slot></slot>
  </div>
</template>
