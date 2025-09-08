import { type HTMLAttributes } from 'vue';
import { pickProps } from '../../../utils/miscUtil';

const propNames = ['onMouseenter', 'onMouseleave'] as const;

export default function useRootProps(props: HTMLAttributes) {
  return pickProps(props, propNames);
}
