<script lang="tsx" setup>
import Render from '@/vc-component/render';
import { isVueNode } from '@/vc-util/Children/util';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { computed, getCurrentInstance, toRefs, type CSSProperties } from 'vue';
import { useMergeSemantic, type SemanticClassNames, type SemanticStyles } from '../_util/hooks';
import { useDescriptionsContextInject, type SemanticName } from './DescriptionsContext';
import type { DescriptionsClassNamesType, DescriptionsStylesType } from './index.vue';

export interface CellProps {
  itemPrefixCls: string;
  span: number;
  class?: string;
  component: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<SemanticName>;
  styles?: SemanticStyles<SemanticName>;
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
  classNames,
} = defineProps<CellProps>();

const { classNames: contextClassNames, styles: contextStyles } = toRefs(useDescriptionsContextInject());

const vm = getCurrentInstance();

const [mergedClassNames, mergedStyles] = useMergeSemantic<DescriptionsClassNamesType, DescriptionsStylesType, CellProps>(
  computed(() => [contextClassNames?.value, classNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({
    props: vm.props as unknown as CellProps,
  })),
);
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
          [`${mergedClassNames?.label}`]: type === 'label',
          [`${mergedClassNames?.content}`]: type === 'content',
        },
        className,
      )
    "
    :style="style"
    :col-span="span"
  >
    <span v-if="isVueNode(label)" :style="mergedStyles?.label">
      <Render :content="label" />
    </span>
    <span v-if="isVueNode(content)" :style="mergedStyles?.content">
      <Render :content="content" />
    </span>
  </component>
  <component v-else :is="Component" :class="clsx(`${itemPrefixCls}-item`, className)" :style="style" :col-span="span">
    <div :class="`${itemPrefixCls}-item-container`">
      <span
        v-if="isVueNode(label)"
        :class="
          clsx(`${itemPrefixCls}-item-label`, mergedClassNames?.label, {
            [`${itemPrefixCls}-item-no-colon`]: !colon,
          })
        "
        :style="mergedStyles?.label"
      >
        <Render :content="label" />
      </span>
      <span
        v-if="isVueNode(content)"
        :class="clsx(`${itemPrefixCls}-item-content`, mergedClassNames?.content)"
        :style="mergedStyles?.content"
      >
        <Render :content="content" />
      </span>
    </div>
  </component>
</template>
