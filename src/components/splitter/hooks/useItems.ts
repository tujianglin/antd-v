import { isValidElement } from '@/vc-util/Children/util';
import { computed, type ComputedRef, type Slots, type VNode } from 'vue';
import type { PanelProps } from '../interface';

export type ItemType = Omit<PanelProps, 'collapsible'> & {
  slots: VNode[];
  collapsible: {
    start?: boolean;
    end?: boolean;
    showCollapsibleIcon: 'auto' | boolean;
  };
};

function getCollapsible(collapsible?: PanelProps['collapsible']): ItemType['collapsible'] {
  if (collapsible && typeof collapsible === 'object') {
    return {
      ...collapsible,
      showCollapsibleIcon: collapsible.showCollapsibleIcon === undefined ? 'auto' : collapsible.showCollapsibleIcon,
    };
  }

  const mergedCollapsible = !!collapsible;
  return {
    start: mergedCollapsible,
    end: mergedCollapsible,
    showCollapsibleIcon: 'auto',
  };
}

/**
 * Convert `children` into `items`.
 */
export default function useItems(slots: Slots): ComputedRef<ItemType[]> {
  return computed(() => {
    const nodes = slots.default?.() ?? [];
    return nodes
      .filter((node) => isValidElement(node))
      .map((node) => {
        const { props } = node;
        const { collapsible, ...restProps } = props || {};
        return {
          ...restProps,
          collapsible: getCollapsible(collapsible),
          slots: node.children as VNode[],
        };
      });
  });
}
