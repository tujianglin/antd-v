<script lang="tsx" setup>
import type { VueNode } from '@/vc-util/type';
import { type CSSProperties } from 'vue';
import type { Variant } from '../config-provider';
import type { SizeType } from '../config-provider/SizeContext';
import type { ColProps } from '../grid';
import type { FormLabelAlign, ScrollFocusOptions } from './interface';

export type RequiredMark = boolean | 'optional' | ((labelNode: VueNode, info: { required: boolean }) => VueNode);
export type FormLayout = 'horizontal' | 'inline' | 'vertical';
export type FormItemLayout = 'horizontal' | 'vertical';

export type { ScrollFocusOptions };

export type SemanticName = 'root' | 'label' | 'content';

export interface FormProps {
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  prefixCls?: string;
  colon?: boolean;
  name?: string;
  layout?: FormLayout;
  labelAlign?: FormLabelAlign;
  labelWrap?: boolean;
  labelCol?: ColProps;
  wrapperCol?: ColProps;
  size?: SizeType;
  disabled?: boolean;
  scrollToFirstError?: ScrollFocusOptions | boolean;
  requiredMark?: RequiredMark;
  rootClassName?: string;
  variant?: Variant;
}
</script>
<template>
  <div></div>
</template>
