import { mapKeys } from 'lodash-es';
import { Comment, type Slots, type VNode } from 'vue';
import type { PanelProps } from '../interface';

function getCollapsible(collapsible?: PanelProps['collapsible']) {
  if (collapsible && typeof collapsible === 'object') {
    return collapsible;
  }
  const mergedCollapsible = !!collapsible;
  return {
    start: mergedCollapsible,
    end: mergedCollapsible,
  };
}

export type ItemType = Omit<PanelProps, 'collapsible'> & {
  slots: VNode[];
  collapsible: {
    start?: boolean;
    end?: boolean;
  };
};

/**
 * Convert `children` into `items`.
 */
export default function useItems(slots: Slots): ItemType[] {
  const items = slots
    .default?.()
    .filter((node) => node.type !== Comment)
    .map((node) => {
      if ((node.type as any).name !== 'SplitterPanel') {
        console.warn('Splitter only accepts Panel as children');
      }
      const props = mapKeys(node.props, (_, key) => key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()));
      const { collapsible, ...restProps } = props || {};
      return {
        ...restProps,
        collapsible: getCollapsible(collapsible === '' ? true : collapsible),
        slots: node.children as VNode[],
      };
    });
  return items;
}
