import { flattenChildren } from '@/vc-util/Dom/findDOMNode';
import { computed, type Ref, type VNode } from 'vue';
import type { ScreenMap } from '../../_util/responsiveObserver';
import { matchScreen } from '../../_util/responsiveObserver';
import type { DescriptionsItemType, InternalDescriptionsItemType } from '../index.vue';

const transChildren2Items = (childNodes?: VNode[]) =>
  flattenChildren(childNodes).map((node) => ({
    ...node?.props,
    key: node.key,
    children: flattenChildren((node.children as any).default?.()) || [],
  })) as DescriptionsItemType[];

export default function useItems(screens: Ref<ScreenMap>, items?: Ref<DescriptionsItemType[]>, children?: Ref<VNode[]>) {
  const mergedItems = computed<DescriptionsItemType[]>(() => items.value || transChildren2Items(children.value));
  const responsiveItems = computed<InternalDescriptionsItemType[]>(() =>
    mergedItems.value.map(({ span, ...restItem }) => {
      if (span === 'filled') {
        return { ...restItem, filled: true };
      }
      return {
        ...restItem,
        span: typeof span === 'number' ? span : matchScreen(screens.value, span),
      };
    }),
  );

  return responsiveItems;
}
