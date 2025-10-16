<script lang="tsx" setup>
import { cloneElement } from '@/vc-util/Children/util';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { computed, type CSSProperties } from 'vue';
import type { NoticeType, SemanticName } from './interface';
import { TypeIcon } from './util';

export interface PureContentProps {
  prefixCls: string;
  type?: NoticeType;
  icon?: VueNode;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, type, icon, classNames: pureContentClassNames, styles } = defineProps<PureContentProps>();

const iconElement = computed(() => icon || (type && TypeIcon[type]));
</script>
<template>
  <div :class="clsx(`${prefixCls}-custom-content`, `${prefixCls}-${type}`)">
    <component
      :is="
        cloneElement(iconElement, (currentProps) => ({
          class: clsx(currentProps.className, pureContentClassNames?.icon),
          style: { ...currentProps.style, ...styles?.icon },
        }))
      "
    />
    <span :class="pureContentClassNames?.content" :style="styles?.content"><slot></slot></span>
  </div>
</template>
