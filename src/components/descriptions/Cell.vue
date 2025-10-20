<script lang="tsx" setup>
import Render from '@/vc-component/render';
import { isVueNode } from '@/vc-util/Children/util';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { toRefs, type CSSProperties } from 'vue';
import { useDescriptionsContextInject, type SemanticName } from './DescriptionsContext';

export interface CellProps {
  itemPrefixCls: string;
  span: number;
  class?: string;
  component: string;
  style?: CSSProperties;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  classNames?: Partial<Record<SemanticName, string>>;
  bordered?: boolean;
  label?: VueNode;
  content?: VueNode;
  colon?: boolean;
  type?: 'label' | 'content' | 'item';
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  itemPrefixCls,
  component: Component,
  span,
  class: className,
  style,
  bordered,
  label,
  content,
  colon,
  type,
  styles,
} = defineProps<CellProps>();

const { classNames: descriptionsClassNames } = toRefs(useDescriptionsContextInject());
</script>
<template>
  <component
    v-if="bordered"
    :is="Component"
    :class="
      clsx(
        {
          [`${itemPrefixCls}-item-label`]: type === 'label',
          [`${itemPrefixCls}-item-content`]: type === 'content',
          [`${descriptionsClassNames?.label}`]: type === 'label',
          [`${descriptionsClassNames?.content}`]: type === 'content',
        },
        className,
      )
    "
    :style="style"
    :col-span="span"
  >
    <span v-if="isVueNode(label)" :style="styles?.label">
      <Render :content="label" />
    </span>
    <span v-if="isVueNode(content)" :style="styles?.content">
      <Render :content="content" />
    </span>
  </component>
  <component v-else :is="Component" :class="clsx(`${itemPrefixCls}-item`, className)" :style="style" :col-span="span">
    <div :class="`${itemPrefixCls}-item-container`">
      <span
        v-if="isVueNode(label)"
        :class="
          clsx(`${itemPrefixCls}-item-label`, descriptionsClassNames?.label, {
            [`${itemPrefixCls}-item-no-colon`]: !colon,
          })
        "
        :style="styles?.label"
      >
        <Render :content="label" />
      </span>
      <span
        v-if="isVueNode(content)"
        :class="clsx(`${itemPrefixCls}-item-content`, descriptionsClassNames?.content)"
        :style="styles?.content"
      >
        <Render :content="content" />
      </span>
    </div>
  </component>
</template>
