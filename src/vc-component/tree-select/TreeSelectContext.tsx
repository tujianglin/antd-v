import type { ExpandAction } from '@/vc-component/tree/Tree.vue';
import type { VueKey } from '@/vc-util/type';
import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';
import type useDataEntities from './hooks/useDataEntities';
import type { DataNode, FieldNames } from './interface';
import type { TreeSelectProps } from './TreeSelect.vue';

export interface TreeSelectContextProps {
  virtual?: boolean;
  popupMatchSelectWidth?: boolean | number;
  listHeight: number;
  listItemHeight: number;
  listItemScrollOffset?: number;
  treeData: DataNode[];
  fieldNames: FieldNames;
  onSelect: (value: VueKey, info: { selected: boolean }) => void;
  treeExpandAction?: ExpandAction;
  treeTitleRender?: (node: any) => any;
  onPopupScroll?: (e) => void;

  // For `maxCount` usage
  leftMaxCount: number | null;
  /** When `true`, only take leaf node as count, or take all as count with `maxCount` limitation */
  leafCountOnly: boolean;
  valueEntities: ReturnType<typeof useDataEntities>['valueEntities'];
  classNames: TreeSelectProps['classNames'];
  styles: TreeSelectProps['styles'];
}

const TreeSelectContext: InjectionKey<Reactive<TreeSelectContextProps>> = Symbol('TreeSelectContext');

export const useTreeSelectContextInject = (): Partial<TreeSelectContextProps> => {
  return inject(TreeSelectContext, reactive<Partial<TreeSelectContextProps>>({}));
};

export const useTreeSelectContextProvider = (props: Reactive<TreeSelectContextProps>) => {
  provide(TreeSelectContext, props);
};

export const TreeSelectContextProvider = defineComponent({
  props: {
    value: Object as PropType<TreeSelectContextProps>,
  },
  setup(props, { slots }) {
    useTreeSelectContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});
