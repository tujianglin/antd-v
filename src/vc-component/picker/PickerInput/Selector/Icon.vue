<script lang="tsx" setup>
import Render from '@/vc-component/render';
import clsx from 'clsx';
import type { HtmlHTMLAttributes } from 'vue';
import { toRefs } from 'vue';
import { usePickerContextInject } from '../context';

export interface IconProps extends /** @vue-ignore */ HtmlHTMLAttributes {
  icon?: any;
  type: 'suffix' | 'clear';
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { icon, type } = defineProps<IconProps>();
const { prefixCls, classNames, styles } = toRefs(usePickerContextInject());
</script>
<template>
  <span v-if="icon" :class="clsx(`${prefixCls}-${type}`, classNames.suffix)" :style="styles.suffix" v-bind="$attrs">
    <Render :content="icon" />
  </span>
</template>
