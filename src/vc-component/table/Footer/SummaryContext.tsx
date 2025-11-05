import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';
import type { ColumnType, StickyOffsets } from '../interface';

type FlattenColumns<RecordType> = (ColumnType<RecordType> & { scrollbar?: boolean })[];

export interface SummaryContextProps<RecordType = any> {
  stickyOffsets: StickyOffsets;
  flattenColumns: FlattenColumns<RecordType>;
  scrollColumnIndex: number | null;
}

const SummaryContext: InjectionKey<Reactive<SummaryContextProps>> = Symbol('SummaryContext');

export const useSummaryContextInject = (): Reactive<Partial<SummaryContextProps>> => {
  return inject(SummaryContext, reactive<Partial<SummaryContextProps>>({}));
};

export const useSummaryContextProvider = (props: Reactive<SummaryContextProps>) => {
  provide(SummaryContext, props);
};

export const SummaryContextProvider = defineComponent({
  props: {
    value: Object as PropType<SummaryContextProps>,
  },
  setup(props, { slots }) {
    useSummaryContextProvider(reactiveComputed(() => props.value));
    return () => slots.default?.();
  },
});

export default SummaryContext;
