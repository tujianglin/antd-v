<script lang="tsx" setup>
import type { ResizeObserverProps } from '@/vc-component/resize-observer';
import { computed, getCurrentInstance, ref, toRefs, watch } from 'vue';
import type { RangeTimeProps, SharedPickerProps, SharedTimeProps, ValueDate } from '../../interface';
import { toArray } from '../../utils/miscUtil';
import { usePickerContextInject } from '../context';
import Footer, { type FooterProps } from './Footer.vue';
import PopupPanel, { type PopupPanelProps } from './PopupPanel.vue';
import PresetPanel from './PresetPanel.vue';
import clsx from 'clsx';
import ResizeObserver from '@/vc-component/resize-observer';
import { omit } from 'lodash-es';
import type { DateType } from '@/vc-util/type';

export type PopupShowTimeConfig = Omit<RangeTimeProps, 'defaultValue' | 'defaultOpenValue' | 'disabledTime'> &
  Pick<SharedTimeProps, 'disabledTime'>;

export interface PopupProps extends FooterProps, PopupPanelProps {
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  panelRender?: SharedPickerProps['panelRender'];

  // Presets
  presets: ValueDate[];
  onPresetHover: (presetValue: DateType[]) => void;
  onPresetSubmit: (presetValue: DateType[]) => void;

  // Range
  activeInfo?: [activeInputLeft: number, activeInputRight: number, selectorWidth: number];
  // Direction
  direction?: 'ltr' | 'rtl';

  // Fill
  /** TimePicker or showTime only */
  defaultOpenValue: DateType;

  // Change
  needConfirm: boolean;
  isInvalid: (date: DateType | DateType[]) => boolean;
  onOk: VoidFunction;

  onPanelMouseDown?: (e: MouseEvent) => void;
}
defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  panelRender,
  internalMode,
  picker,
  showNow,

  // Range
  range,
  multiple,
  activeInfo = [0, 0, 0],

  // Presets
  presets,
  onPresetHover,
  onPresetSubmit,

  // Focus
  onFocus,
  onBlur,
  onPanelMouseDown,

  // Direction
  direction,

  // Change
  value,
  onSelect,
  isInvalid,
  defaultOpenValue,
  onOk,
  onSubmit,
} = defineProps<PopupProps>();

const { prefixCls } = toRefs(usePickerContextInject());
const panelPrefixCls = computed(() => `${prefixCls.value}-panel`);

const rtl = computed(() => direction === 'rtl');

// ========================= Refs =========================
const arrowRef = ref<HTMLDivElement>(null);
const wrapperRef = ref<HTMLDivElement>(null);

// ======================== Offset ========================
const containerWidth = ref<number>(0);
const containerOffset = ref<number>(0);
const arrowOffset = ref<number>(0);

const onResize: ResizeObserverProps['onResize'] = (info) => {
  if (info.width) {
    containerWidth.value = info.width;
  }
};
const activeInputLeft = computed(() => activeInfo[0]);
const activeInputRight = computed(() => activeInfo[1]);
const selectorWidth = computed(() => activeInfo[2]);

const retryTimes = ref(0);

watch(
  activeInputLeft,
  () => {
    retryTimes.value = 10;
  },
  { immediate: true },
);

watch(
  [retryTimes, rtl, containerWidth, activeInputLeft, activeInputRight, selectorWidth, () => range],
  () => {
    // `activeOffset` is always align with the active input element
    // So we need only check container contains the `activeOffset`
    if (range && wrapperRef.value) {
      // Offset in case container has border radius
      const arrowWidth = arrowRef.value?.offsetWidth || 0;

      // Arrow Offset
      const wrapperRect = wrapperRef.value.getBoundingClientRect();
      if (!wrapperRect.height || wrapperRect.right < 0) {
        retryTimes.value = Math.max(0, retryTimes.value - 1);
        return;
      }

      const nextArrowOffset = (rtl.value ? activeInputRight.value - arrowWidth : activeInputLeft.value) - wrapperRect.left;
      arrowOffset.value = nextArrowOffset;

      // Container Offset
      if (containerWidth.value && containerWidth.value < selectorWidth.value) {
        const offset = rtl.value
          ? wrapperRect.right - (activeInputRight.value - arrowWidth + containerWidth.value)
          : activeInputLeft.value + arrowWidth - wrapperRect.left - containerWidth.value;

        const safeOffset = Math.max(0, offset);
        containerOffset.value = safeOffset;
      } else {
        containerOffset.value = 0;
      }
    }
  },
  { immediate: true, deep: true },
);

// ======================== Custom ========================
function filterEmpty<T>(list: T[]) {
  return list.filter((item) => item);
}

const valueList = computed(() => filterEmpty(toArray(value)));

const isTimePickerEmptyValue = computed(() => picker === 'time' && !valueList.value.length);

const footerSubmitValue = computed(() => {
  if (isTimePickerEmptyValue.value) {
    return filterEmpty([defaultOpenValue]);
  }
  return valueList.value;
});

const popupPanelValue = computed(() => (isTimePickerEmptyValue.value ? defaultOpenValue : valueList.value));

const disableSubmit = computed(() => {
  // Empty is invalid
  if (!footerSubmitValue.value.length) {
    return true;
  }

  return footerSubmitValue.value.some((val) => isInvalid(val));
});

const onFooterSubmit = () => {
  // For TimePicker, we will additional trigger the value update
  if (isTimePickerEmptyValue.value) {
    onSelect(defaultOpenValue);
  }

  onOk?.();
  onSubmit?.();
};

const vm = getCurrentInstance();

const MergedNodes = () => {
  let mergedNodes = (
    <div class={`${prefixCls.value}-panel-layout`}>
      {/* `any` here since PresetPanel is reused for both Single & Range Picker which means return type is not stable */}
      <PresetPanel prefixCls={prefixCls.value} presets={presets} onClick={onPresetSubmit} onHover={onPresetHover} />
      <div>
        <PopupPanel
          {...(omit(vm.props, ['onSelect']) as any)}
          onSelect={(e) => {
            onSelect?.(e);
          }}
          value={popupPanelValue.value}
        />
        <Footer
          {...(omit(vm.props, ['onSubmit']) as any)}
          showNow={multiple ? false : showNow}
          invalid={disableSubmit.value}
          onSubmit={onFooterSubmit}
        />
      </div>
    </div>
  );
  if (panelRender) {
    mergedNodes = panelRender(mergedNodes);
  }
  return mergedNodes;
};

// ======================== Render ========================
const containerPrefixCls = computed(() => `${panelPrefixCls.value}-container`);

const marginLeft = 'marginLeft';
const marginRight = 'marginRight';
</script>
<template>
  <div
    v-if="range"
    @mousedown="onPanelMouseDown"
    ref="wrapperRef"
    :class="clsx(`${prefixCls}-range-wrapper`, `${prefixCls}-${picker}-range-wrapper`)"
  >
    <div ref="arrowRef" :class="`${prefixCls}-range-arrow`" :style="{ left: `${arrowOffset}px` }"></div>
    <ResizeObserver @resize="onResize">
      <div
        @mousedown="onPanelMouseDown"
        :tabindex="-1"
        :class="clsx(containerPrefixCls, `${prefixCls}-${internalMode}-panel-container`)"
        :style="{
          [rtl ? marginRight : marginLeft]: `${containerOffset}px`,
          [rtl ? marginLeft : marginRight]: 'auto',
        }"
        @focusin="onFocus"
        @focusout="onBlur"
      >
        <MergedNodes />
      </div>
    </ResizeObserver>
  </div>
  <div
    v-else
    @mousedown="onPanelMouseDown"
    :tabindex="-1"
    :class="clsx(containerPrefixCls, `${prefixCls}-${internalMode}-panel-container`)"
    :style="{
      [rtl ? marginRight : marginLeft]: `${containerOffset}px`,
      [rtl ? marginLeft : marginRight]: 'auto',
    }"
    @focusin="onFocus"
    @focusout="onBlur"
  >
    <MergedNodes />
  </div>
</template>
