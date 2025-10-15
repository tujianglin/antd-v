import { computed, type Ref } from 'vue';
import type { SharedPickerProps } from '../interface';

export type FilledPanelClassNames = NonNullable<SharedPickerProps['classNames']>['popup'];

export type FilledPanelStyles = NonNullable<SharedPickerProps['styles']>['popup'];

export type FilledClassNames = NonNullable<SharedPickerProps['classNames']> & {
  popup: FilledPanelClassNames;
};

export type FilledStyles = NonNullable<SharedPickerProps['styles']> & {
  popup: FilledPanelStyles;
};

/**
 * Convert `classNames` & `styles` to a fully filled object
 */
export default function useSemantic(
  classNames?: Ref<SharedPickerProps['classNames']>,
  styles?: Ref<SharedPickerProps['styles']>,
) {
  const mergedClassNames = computed<FilledClassNames>(() => ({
    ...classNames?.value,
    popup: classNames?.value?.popup || {},
  }));

  const mergedStyles = computed<FilledStyles>(() => ({
    ...styles?.value,
    popup: styles?.value?.popup || {},
  }));

  return [mergedClassNames, mergedStyles] as const;
}
