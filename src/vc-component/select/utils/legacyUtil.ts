import isValidNode from '@/components/_util/isValidNode';
import { flattenChildren } from '@/vc-util/Dom/findDOMNode';
import { type VNode } from 'vue';
import type { BaseOptionType, DefaultOptionType } from '../interface';

function convertNodeToOption<OptionType extends BaseOptionType = DefaultOptionType>(node: VNode): OptionType {
  const { key, children, props } = node as VNode & { children: { default: () => VNode } };
  const { value, disabled, ...restProps } = props || {};
  return {
    key,
    value: value !== undefined ? value : key,
    children: children.default?.(),
    disabled: disabled === '' || disabled,
    ...(restProps as any),
  };
}

export function convertChildrenToData<OptionType extends BaseOptionType = DefaultOptionType>(
  nodes: VNode[],
  optionOnly: boolean = false,
): OptionType[] {
  return flattenChildren(nodes)
    .map((node: VNode, index: number): OptionType | null => {
      if (!isValidNode(node) || !node.type) {
        return null;
      }
      const {
        type: { isSelectOptGroup },
        key,
        children,
        props,
      } = node as VNode & {
        type: { isSelectOptGroup?: boolean };
        children: { default?: () => any; label?: () => any };
      };

      if (optionOnly || !isSelectOptGroup) {
        return convertNodeToOption(node);
      }
      const child = children && children.default ? children.default() : undefined;
      const label = props?.label || children.label?.() || key;
      return {
        key: `__VC_SELECT_GRP__${String(key === null ? index : key)}__`,
        label,
        ...(props as any),
        options: convertChildrenToData(child || []),
      };
    })
    .filter((data) => data);
}
