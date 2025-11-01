<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, ref, toRefs, watch, type CSSProperties } from 'vue';
import ContextIsolator from '../_util/ContextIsolator';
import useMergeSemantic from '../_util/hooks/useMergeSemantic';
import { getStatusClassNames } from '../_util/statusUtils';
import { devUseWarning } from '../_util/warning';
import { useComponentConfig } from '../config-provider/context';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useSize from '../config-provider/hooks/useSize';
import type { PopoverProps } from '../popover';
import Popover from '../popover';
import { useCompactItemContext } from '../space/CompactContext';
import { AggregationColor } from './color';
import type { ColorPickerPanelProps } from './ColorPickerPanel.vue';
import ColorPickerPanel from './ColorPickerPanel.vue';
import ColorTrigger from './components/ColorTrigger.vue';
import useModeColor from './hooks/useModeColor';
import type { ColorFormatType, ColorPickerProps, ColorValueType, ModeType } from './interface';
import useStyle from './style';
import { genAlphaColor, generateColor, getColorAlpha } from './util';

defineOptions({ name: 'ColorPicker', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  mode,
  allowClear = false,
  presets,
  trigger = 'click',
  disabled = undefined,
  placement = 'bottomLeft',
  arrow = true,
  panelRender,
  showText,
  style,
  class: className,
  size: customizeSize,
  rootClassName,
  prefixCls: customizePrefixCls,
  styles,
  classNames,
  disabledAlpha = false,
  onFormatChange,
  onChange,
  onClear,
  onOpenChange,
  onChangeComplete,
  getPopupContainer,
  autoAdjustOverflow = true,
  destroyOnHidden,
  disabledFormat,
  ...rest
} = defineProps<ColorPickerProps>();

// ======================== Base ========================
// Color
const color = defineModel<ColorValueType>('value', {
  set: (v: any) => {
    const { format } = rest as any;
    if (!v) return v;

    // 如果是 AggregationColor 实例
    if (v instanceof AggregationColor) {
      // 🔹 如果是渐变色，永远返回 CSS 字符串（无论 format）
      if (v.isGradient()) return v.toCssString();

      // 🔹 否则是单色，按 format 转换
      if (format === 'hex') return v.toHexString();
      if (format === 'rgb') return v.toRgbString();
      if (format === 'hsb') return v.toHsbString();

      // 默认 rgb
      return v.toRgbString();
    }

    // 🔹 如果是数组 [{ color, percent }]
    if (Array.isArray(v)) {
      const ag = new AggregationColor(v);
      return ag.toCssString();
    }

    // 🔹 如果是渐变字符串
    if (typeof v === 'string' && v.startsWith('linear-gradient')) {
      return v;
    }

    // 🔹 普通颜色字符串
    return v;
  },

  get: (v: any) => {
    if (!v) return v;

    // 🌈 渐变字符串
    if (typeof v === 'string' && v.startsWith('linear-gradient')) {
      const gradient = AggregationColor.parseGradient(v);
      if (gradient) return new AggregationColor(gradient);
    }

    // 🧩 数组形式
    if (Array.isArray(v)) {
      return new AggregationColor(v);
    }

    // 🎨 普通单色
    if (typeof v === 'string') {
      return new AggregationColor(v);
    }

    // 已经是 AggregationColor
    if (v instanceof AggregationColor) {
      return v;
    }

    return new AggregationColor('');
  },
});

const {
  getPrefixCls,
  direction,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('colorPicker'));

const [mergedClassNames, mergedStyles] = useMergeSemantic(
  computed(() => [contextClassNames?.value, classNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({
    popup: {
      _default: 'root',
    },
  })),
);

const contextDisabled = useDisabledContextInject();
const mergedDisabled = computed(() => disabled ?? contextDisabled?.value);

const popupOpen = defineModel('open', { default: false, get: (openData) => !mergedDisabled.value && openData });

watch(popupOpen, () => {
  onOpenChange?.(popupOpen.value);
});

const formatValue = defineModel<ColorFormatType>('format');

watch(
  formatValue,
  () => {
    onFormatChange?.(formatValue.value);
  },
  { deep: true },
);

const prefixCls = computed(() => getPrefixCls.value('color-picker', customizePrefixCls));

// ================== Value & Mode =================
const [mergedColor, setColor, modeState, modeOptions] = useModeColor(
  color,
  computed(() => mode),
);

const isAlphaColor = computed(() => getColorAlpha(mergedColor.value) < 100);

// ==================== Change =====================
// To enhance user experience, we cache the gradient color when switch from gradient to single
// If user not modify single color, we will use the cached gradient color.
const cachedGradientColor = ref<AggregationColor | null>(null);

const onInternalChangeComplete: ColorPickerProps['onChangeComplete'] = (color) => {
  if (onChangeComplete) {
    let changeColor = generateColor(color);

    // ignore alpha color
    if (disabledAlpha && isAlphaColor) {
      changeColor = genAlphaColor(color);
    }
    onChangeComplete(changeColor);
  }
};

const onInternalChange: ColorPickerPanelProps['onChange'] = (data, changeFromPickerDrag) => {
  let color: AggregationColor = generateColor(data as AggregationColor);

  // ignore alpha color
  if (disabledAlpha && isAlphaColor) {
    color = genAlphaColor(color);
  }

  setColor(color);
  cachedGradientColor.value = null;

  // Trigger change event
  if (onChange) {
    onChange(color, color.toCssString());
  }

  // Only for drag-and-drop color picking
  if (!changeFromPickerDrag) {
    onInternalChangeComplete(color);
  }
};

// =================== Gradient ====================
const activeIndex = ref(0);
const gradientDragging = ref(false);

// Mode change should also trigger color change
const onInternalModeChange = (newMode: ModeType) => {
  modeState.value = newMode;

  if (newMode === 'single' && mergedColor.value.isGradient()) {
    activeIndex.value = 0;
    onInternalChange(new AggregationColor(mergedColor.value.getColors()[0].color));

    // Should after `onInternalChange` since it will clear the cached color
    cachedGradientColor.value = mergedColor.value;
  } else if (newMode === 'gradient' && !mergedColor.value.isGradient()) {
    const baseColor = isAlphaColor.value ? genAlphaColor(mergedColor.value) : mergedColor.value;

    onInternalChange(
      new AggregationColor(
        cachedGradientColor.value ||
          ([
            {
              percent: 0,
              color: baseColor,
            },
            {
              percent: 100,
              color: baseColor,
            },
          ] as any),
      ),
    );
  }
};

// ================== Form Status ==================

// ==================== Compact ====================
const { compactSize, compactItemClassnames } = useCompactItemContext(prefixCls, direction);

// ===================== Style =====================
const mergedSize = useSize(computed(() => (ctx) => customizeSize ?? compactSize.value ?? ctx));

const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);
const rtlCls = computed(() => ({ [`${prefixCls.value}-rtl`]: direction.value }));
const mergedRootCls = computed(() =>
  clsx(mergedClassNames.value.root, rootClassName, cssVarCls.value, rootCls.value, rtlCls.value),
);
const mergedCls = computed(() =>
  clsx(
    getStatusClassNames(prefixCls.value),
    {
      [`${prefixCls.value}-sm`]: mergedSize.value === 'small',
      [`${prefixCls.value}-lg`]: mergedSize.value === 'large',
    },
    compactItemClassnames?.value,
    contextClassName?.value,
    mergedRootCls?.value,
    className,
    hashId?.value,
  ),
);
const mergedPopupCls = computed(() => clsx(prefixCls.value, mergedRootCls?.value, mergedClassNames?.value?.popup?.root));

// ===================== Warning ======================
if (process.env.NODE_ENV !== 'production') {
  const warning = devUseWarning('ColorPicker');

  warning(
    !(disabledAlpha && isAlphaColor.value),
    'usage',
    '`disabledAlpha` will make the alpha to be 100% when use alpha color.',
  );
}

const popoverProps = computed<PopoverProps>(() => ({
  open: popupOpen.value,
  trigger,
  placement,
  arrow,
  rootClassName,
  getPopupContainer,
  autoAdjustOverflow,
  destroyOnHidden,
}));

const mergedStyle = computed<CSSProperties>(() => ({ ...mergedStyles?.value?.root, ...contextStyle?.value, ...style }));

// ============================ zIndex ============================
</script>
<template>
  <Popover
    :class-names="{ root: mergedPopupCls }"
    :styles="{ root: mergedStyles.popup?.root, body: styles?.popupOverlayInner }"
    @open-change="
      (visible) => {
        if (!visible || !mergedDisabled) {
          popupOpen = visible;
        }
      }
    "
    v-bind="popoverProps"
  >
    <template #content>
      <ContextIsolator form>
        <ColorPickerPanel
          :mode="modeState"
          @mode-change="onInternalModeChange"
          :mode-options="modeOptions"
          :prefix-cls="prefixCls"
          :value="mergedColor"
          :allow-clear="allowClear"
          :disabled="mergedDisabled"
          :disabled-alpha="disabledAlpha"
          :presets="presets"
          :panel-render="panelRender"
          :format="formatValue"
          @format-change="(e) => (formatValue = e)"
          @change="onInternalChange"
          @change-complete="onInternalChangeComplete"
          @clear="onClear"
          :active-index="activeIndex"
          @active="(e) => (activeIndex = e)"
          :gradient-dragging="gradientDragging"
          @gradient-dragging="(e) => (gradientDragging = e)"
          :disabled-format="disabledFormat"
        />
      </ContextIsolator>
    </template>
    <slot>
      <ColorTrigger
        :active-index="popupOpen ? activeIndex : -1"
        :open="popupOpen"
        :class="mergedCls"
        :style="mergedStyle"
        :prefix-cls="prefixCls"
        :disabled="mergedDisabled"
        :show-text="showText"
        :format="formatValue"
        v-bind="rest"
        :color="mergedColor"
      />
    </slot>
  </Popover>
</template>
