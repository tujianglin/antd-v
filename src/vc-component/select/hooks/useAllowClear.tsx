import type { RenderNode } from '@/components/_util/type';
import { computed, ref, type Ref } from 'vue';
import TransBtn from '../TransBtn.vue';
import type { DisplayValueType, Mode } from '../interface';

export const useAllowClear = (
  prefixCls: string,
  onClearMouseDown: (e: MouseEvent) => void,
  displayValues: Ref<DisplayValueType[]>,
  allowClear?: Ref<boolean | { clearIcon?: RenderNode }>,
  disabled: Ref<boolean> = ref(false),
  mergedSearchValue?: Ref<string>,
  mode?: Mode,
) => {
  const mergedClearIcon = computed((): any => {
    if (typeof allowClear.value === 'object') {
      return allowClear.value.clearIcon;
    }
  });

  const mergedAllowClear = computed((): boolean => {
    if (
      !disabled.value &&
      !!allowClear.value &&
      (displayValues?.value?.length || mergedSearchValue.value) &&
      !(mode === 'combobox' && mergedSearchValue.value === '')
    ) {
      return true;
    }
    return false;
  });

  return {
    allowClear: mergedAllowClear,
    clearIcon: computed(() => (
      <TransBtn class={`${prefixCls}-clear`} onMousedown={onClearMouseDown} customizeIcon={mergedClearIcon.value}>
        ×
      </TransBtn>
    )),
  };
};
