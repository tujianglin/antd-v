import type { VueNode } from '@/vc-util/type';
import { reactiveComputed } from '@vueuse/core';
import { computed, ref, toRefs, watch, type Ref } from 'vue';
import { useLocale } from '../../locale';
import type { AggregationColor } from '../color';
import type { ColorPickerProps, ColorValueType, ModeType } from '../interface';
import { generateColor } from '../util';

export type ModeOptions = {
  label: VueNode;
  value: ModeType;
}[];

/**
 * Combine the `color` and `mode` to make sure sync of state.
 */
export default function useModeColor(
  mergedColor: Ref<ColorValueType>,
  mode?: Ref<ColorPickerProps['mode']>,
): [
  color: Ref<AggregationColor>,
  setColor: (color: AggregationColor) => void,
  mode: Ref<ModeType>,
  modeOptionList: Ref<ModeOptions>,
] {
  const [locale] = useLocale('ColorPicker');

  // Mode
  const modeState = ref<ModeType>('single');

  const { modeOptionList, modeSet } = toRefs(
    reactiveComputed(() => {
      const list = (Array.isArray(mode.value) ? mode.value : [mode.value]).filter((m) => m);
      if (!list.length) {
        list.push('single');
      }

      const modes = new Set(list);
      const optionList: ModeOptions = [];

      const pushOption = (modeType: ModeType, localeTxt: string) => {
        if (modes.has(modeType)) {
          optionList.push({
            label: localeTxt,
            value: modeType,
          });
        }
      };

      pushOption('single', locale.value.singleColor);
      pushOption('gradient', locale.value.gradientColor);

      return { modeOptionList: optionList, modeSet: modes };
    }),
  );

  // ======================== Post ========================
  // We need align `mode` with `color` state

  // >>>>> Color
  const cacheColor = ref<AggregationColor | null>(null);

  const setColor = (nextColor: AggregationColor) => {
    cacheColor.value = nextColor;
    mergedColor.value = nextColor;
  };

  const postColor = computed(() => {
    const colorObj = generateColor(mergedColor.value || '');

    // Use `cacheColor` in case the color is `cleared`
    return colorObj.equals(cacheColor.value as AggregationColor) ? (cacheColor.value! as AggregationColor) : colorObj;
  });

  // >>>>> Mode
  const postMode = computed(() => {
    if (modeSet.value.has(modeState.value)) {
      return modeState.value;
    }

    return modeOptionList?.value?.[0]?.value;
  });

  // ======================= Effect =======================
  // Dynamic update mode when color change
  watch(
    postColor,
    () => {
      modeState.value = postColor.value.isGradient() ? 'gradient' : 'single';
    },
    { immediate: true, deep: true },
  );

  // ======================= Return =======================
  return [postColor, setColor, postMode, modeOptionList];
}
