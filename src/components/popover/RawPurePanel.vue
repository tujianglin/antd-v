<script lang="tsx" setup>
import { Popup } from '@/vc-component/tooltip';
import clsx from 'clsx';
import { computed, getCurrentInstance } from 'vue';
import { useMergeSemantic } from '../_util/hooks';
import type { PopoverClassNamesType, PopoverProps, PopoverStylesType } from './index.vue';
import Overlay from './Overlay.vue';
interface RawPurePanelProps extends PopoverProps {
  hashId: string;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  hashId,
  prefixCls,
  class: className,
  style,
  placement = 'top',
  title,
  content,
  classNames,
  styles,
} = defineProps<RawPurePanelProps>();
const slots = defineSlots<{ title: any; content: any; default: any }>();

const titleNode = computed(() => slots.title || title);
const contentNode = computed(() => slots.content || content);

const vm = getCurrentInstance();

const [mergedClassNames, mergedStyles] = useMergeSemantic<PopoverClassNamesType, PopoverStylesType, PopoverProps>(
  computed(() => [classNames]),
  computed(() => [styles]),
  computed(() => ({
    props: {
      ...vm.props,
      placement,
    },
  })),
);

const rootClassName = computed(() =>
  clsx(hashId, prefixCls, `${prefixCls}-pure`, `${prefixCls}-placement-${placement}`, className),
);
</script>
<template>
  <div :class="rootClassName" :style="style">
    <div :class="`${prefixCls}-arrow`"></div>
    <Popup v-bind="$props" :class="hashId" :prefix-cls="prefixCls" :class-names="mergedClassNames" :styles="mergedStyles">
      <slot>
        <Overlay :prefix-cls="prefixCls" :title="titleNode" :content="contentNode" />
      </slot>
    </Popup>
  </div>
</template>
