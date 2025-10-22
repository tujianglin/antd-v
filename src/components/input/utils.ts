import type { VueNode } from '@/vc-util/type';
import type { InputProps } from './interface';

export function hasPrefixSuffix(props: {
  prefix?: VueNode;
  suffix?: VueNode;
  allowClear?: InputProps['allowClear'];
  showCount?: InputProps['showCount'];
}) {
  return !!(props.prefix || props.suffix || props.allowClear || props.showCount);
}
