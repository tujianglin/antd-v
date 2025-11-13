import type { Tab } from '@/vc-component/tabs/interface';
import { isValidElement } from '@/vc-util/Children/util';
import { flattenChildren } from '@/vc-util/Dom/findDOMNode';
import { computed, type ComputedRef, type VNode } from 'vue';
import { devUseWarning } from '../../_util/warning';
import type { TabsProps } from '../index.vue';

function filter<T>(items: (T | null)[]): T[] {
  return items.filter((item) => item) as T[];
}

function useLegacyItems(items?: ComputedRef<TabsProps['items']>, children?: ComputedRef<VNode[]>) {
  return computed(() => {
    if (process.env.NODE_ENV !== 'production') {
      const warning = devUseWarning('Tabs');
      warning.deprecated(!children?.value, 'Tabs.TabPane', 'items');
    }

    if (items?.value) {
      return items?.value;
    }

    const childrenItems = flattenChildren(children?.value).map((node, index) => {
      if (isValidElement(node)) {
        const { key, props } = node;
        const { tab, ...restProps } = props || {};
        const item: Tab = {
          key: String(key || index) as any,
          ...restProps,
          label: tab,
          children: (node.children as any).default?.(),
        };
        return item;
      }

      return null;
    });
    return filter(childrenItems);
  });
}

export default useLegacyItems;
