import { computed, type Ref } from 'vue';
import type { ScreenMap } from '../../_util/responsiveObserver';
import { matchScreen } from '../../_util/responsiveObserver';
import type { DescriptionsItemType, InternalDescriptionsItemType } from '../index.vue';

export default function useItems(screens: Ref<ScreenMap>, items?: Ref<DescriptionsItemType[]>) {
  const responsiveItems = computed<InternalDescriptionsItemType[]>(() =>
    items.value.map(({ span, ...restItem }) => {
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
