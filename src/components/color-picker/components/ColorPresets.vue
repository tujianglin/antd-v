<script lang="tsx" setup>
import { computed } from 'vue';
import { ColorBlock } from '@/vc-component/color-picker';
import type { CollapseProps } from '../../collapse';
import Collapse from '../../collapse';
import { useLocale } from '../../locale';
import { useToken } from '../../theme/internal';
import type { AggregationColor } from '../color';
import type { PresetsItem } from '../interface';
import { generateColor } from '../util';
import clsx from 'clsx';
import { isBright } from './utils';
import Render from '@/vc-component/render';
import useControlledState from '@/vc-util/hooks/useControlledState';

interface ColorPresetsProps {
  prefixCls: string;
  presets: PresetsItem[];
  value?: AggregationColor;
  onChange?: (value: AggregationColor) => void;
}

const { prefixCls, presets, value: color, onChange } = defineProps<ColorPresetsProps>();

const genPresetColor = (list: PresetsItem[]) =>
  list.map((value) => {
    value.colors = value.colors.map(generateColor);
    return value;
  });

const genCollapsePanelKey = (preset: PresetsItem, index: number) => {
  const mergedKey = preset.key ?? index;
  return `panel-${mergedKey}`;
};

const [locale] = useLocale('ColorPicker');
const [, token] = useToken();
const [innterPresetsValue] = useControlledState(
  genPresetColor(presets),
  computed(() => genPresetColor(presets)),
);
const presetsValue = computed(() => genPresetColor(innterPresetsValue.value));

const colorPresetsPrefixCls = computed(() => `${prefixCls}-presets`);

const activeKeys = computed(() =>
  presetsValue.value.reduce<string[]>((acc, preset, index) => {
    const { defaultOpen = true } = preset;
    if (defaultOpen) {
      acc.push(genCollapsePanelKey(preset, index));
    }
    return acc;
  }, []),
);

const handleClick = (colorValue: AggregationColor) => {
  onChange?.(colorValue);
};

const items = computed(() =>
  presetsValue.value.map<NonNullable<CollapseProps['items']>[number]>((preset, index) => ({
    key: genCollapsePanelKey(preset, index),
    label: (
      <div class={`${colorPresetsPrefixCls.value}-label`}>
        <Render content={preset?.label}></Render>
      </div>
    ),
    children: (
      <div class={`${colorPresetsPrefixCls.value}-items`}>
        {Array.isArray(preset?.colors) && preset.colors?.length > 0 ? (
          (preset.colors as AggregationColor[]).map((presetColor, index) => {
            const colorInst = generateColor(presetColor);

            return (
              <ColorBlock
                key={`preset-${index}-${presetColor.toHexString()}`}
                color={colorInst.toCssString()}
                prefixCls={prefixCls}
                class={clsx(`${colorPresetsPrefixCls.value}-color`, {
                  [`${colorPresetsPrefixCls.value}-color-checked`]: presetColor.toCssString() === color?.toCssString(),
                  [`${colorPresetsPrefixCls.value}-color-bright`]: isBright(presetColor, token.value.colorBgElevated),
                })}
                onClick={() => handleClick(presetColor)}
              />
            );
          })
        ) : (
          <span class={`${colorPresetsPrefixCls.value}-empty`}>{locale.value.presetEmpty}</span>
        )}
      </div>
    ),
  })),
);
</script>
<template>
  <div :class="colorPresetsPrefixCls">
    <Collapse :active-key="activeKeys" ghost :items="items" />
  </div>
</template>
