import type { DataEntity, IconType } from '@/vc-component/tree/interface';
import type { VueKey } from '@/vc-util/type';
import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';
import type { LegacyDataNode } from './interface';

interface LegacySelectContextProps {
  checkable: any;
  checkedKeys: VueKey[];
  halfCheckedKeys: VueKey[];
  treeExpandedKeys: VueKey[];
  treeDefaultExpandedKeys: VueKey[];
  onTreeExpand: (keys: VueKey[]) => void;
  treeDefaultExpandAll: boolean;
  treeIcon: IconType;
  showTreeIcon: boolean;
  switcherIcon: IconType;
  treeLine: boolean;
  treeNodeFilterProp: string;
  treeLoadedKeys: VueKey[];
  treeMotion: any;
  loadData: (treeNode: LegacyDataNode) => Promise<unknown>;
  onTreeLoad: (loadedKeys: VueKey[]) => void;

  keyEntities: Record<VueKey, DataEntity<any>>;
}

const LegacySelectContext: InjectionKey<Reactive<LegacySelectContextProps>> = Symbol('LegacySelectContext');

export const useLegacySelectContextInject = () => {
  return inject(LegacySelectContext, reactive<Partial<LegacySelectContextProps>>({}));
};

export const useLegacySelectContextProvider = (props: Reactive<LegacySelectContextProps>) => {
  provide(LegacySelectContext, props);
};

export const LegacySelectContextProvider = defineComponent({
  props: {
    value: Object as PropType<LegacySelectContextProps>,
  },
  setup(props, { slots }) {
    useLegacySelectContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});
