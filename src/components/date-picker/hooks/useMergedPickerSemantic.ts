import type { PickerProps } from '@/vc-component/picker';
import clsx from 'clsx';
import { computed, toRefs, type Ref } from 'vue';
import { useMergeSemantic } from '../../_util/hooks';
import { useComponentConfig } from '../../config-provider/context';
import type { PickerClassNames, RequiredSemanticPicker } from '../generatePicker/interface';

const useMergedPickerSemantic = (
  pickerType: Ref<'timePicker' | 'datePicker'>,
  classNames?: Ref<PickerClassNames>,
  styles?: Ref<PickerProps['styles']>,
  mergedProps?: Ref<PickerProps>,
) => {
  const { classNames: contextClassNames, styles: contextStyles } = toRefs(useComponentConfig(pickerType.value));

  const [mergedClassNames, mergedStyles] = useMergeSemantic(
    computed(() => [contextClassNames?.value as PickerProps['classNames'], classNames?.value as PickerProps['classNames']]),
    computed(() => [contextStyles?.value as PickerProps['styles'], styles?.value]),
    computed(() => ({ props: mergedProps?.value })),
    computed(() => ({
      popup: {
        _default: 'root',
      },
    })),
  );

  const filledClassNames = computed(() => ({
    ...mergedClassNames?.value,
    popup: {
      ...mergedClassNames?.value?.popup,
      root: clsx(mergedClassNames?.value?.popup?.root),
    },
  }));

  const filledStyles = computed(() => ({
    ...mergedStyles?.value,
    popup: {
      ...mergedStyles?.value?.popup,
      root: {
        ...mergedStyles?.value?.popup?.root,
      },
    },
  }));
  // Return
  return [filledClassNames, filledStyles] as RequiredSemanticPicker;
};

export default useMergedPickerSemantic;
