import type { VueNode } from '@/vc-util/type';
import { computed, ref, type Ref } from 'vue';
import type { DisplayValueType, Mode } from '../interface';

export interface AllowClearConfig {
  allowClear: boolean;
  clearIcon: VueNode;
}

export const useAllowClear = (
  _prefixCls: Ref<string>,
  displayValues: Ref<DisplayValueType[]>,
  allowClear?: Ref<boolean | { clearIcon?: VueNode }>,
  disabled: Ref<boolean> = ref(false),
  mergedSearchValue?: Ref<string>,
  mode?: Ref<Mode>,
) => {
  // Convert boolean to object first
  const allowClearConfig = computed<Partial<AllowClearConfig>>(() => {
    if (typeof allowClear.value === 'boolean') {
      return { allowClear: allowClear.value };
    }
    if (allowClear.value && typeof allowClear.value === 'object') {
      return allowClear.value;
    }
    return { allowClear: false };
  });

  const mergedAllowClear = computed(
    () =>
      !disabled?.value &&
      allowClearConfig?.value?.allowClear !== false &&
      (displayValues?.value?.length || mergedSearchValue?.value) &&
      !(mode?.value === 'combobox' && mergedSearchValue?.value === ''),
  );

  return {
    allowClear: mergedAllowClear,
    clearIcon: computed(() => (mergedAllowClear.value ? allowClearConfig.value?.clearIcon || '×' : null)),
  };
};
