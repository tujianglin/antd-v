<script lang="tsx" setup>
import { Render } from '@/components';
import { clsx } from 'clsx';
import { toRefs } from 'vue';
import { useBaseSelectContextInject } from '../../hooks/useBaseProps';
import { useSelectInputContextInject } from '../context';

export interface PlaceholderProps {
  show?: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });
const { show = true } = defineProps<PlaceholderProps>();

const { prefixCls, placeholder, displayValues } = toRefs(useSelectInputContextInject());
const { classNames, styles } = toRefs(useBaseSelectContextInject());
</script>
<template>
  <div
    v-if="!displayValues?.length"
    :class="clsx(`${prefixCls}-placeholder`, classNames?.placeholder)"
    :style="{
      visibility: show ? 'visible' : 'hidden',
      ...styles?.placeholder,
    }"
  >
    <Render :content="placeholder" />
  </div>
</template>
