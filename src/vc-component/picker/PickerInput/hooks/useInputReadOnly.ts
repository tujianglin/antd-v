import { computed, type Ref } from 'vue';
import type { FormatType } from '../../interface';

export default function useInputReadOnly<DateType = any>(
  formatList: Ref<FormatType<DateType>[]>,
  inputReadOnly?: Ref<boolean>,
  multiple?: Ref<boolean>,
) {
  return computed(() => {
    if (typeof formatList.value[0] === 'function' || multiple?.value) {
      return true;
    }

    return inputReadOnly?.value;
  });
}
