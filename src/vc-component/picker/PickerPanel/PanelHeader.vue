<script lang="tsx" setup>
import { Render } from '@/components';
import clsx from 'clsx';
import { computed, toRefs, type CSSProperties } from 'vue';
import { isSameOrAfter } from '../utils/dateUtil';
import { usePanelContextInject, usePickerHackContextInject } from './context';

export interface HeaderProps<DateType extends object> {
  offset?: (distance: number, date: DateType) => DateType;
  superOffset?: (distance: number, date: DateType) => DateType;
  onChange?: (date: DateType) => void;

  // Limitation
  getStart?: (date: DateType) => DateType;
  getEnd?: (date: DateType) => DateType;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  offset,
  superOffset,
  onChange,

  getStart,
  getEnd,
} = defineProps<HeaderProps<any>>();

const HIDDEN_STYLE: CSSProperties = {
  visibility: 'hidden',
};

const {
  prefixCls,
  classNames,
  styles,

  // Icons
  prevIcon: _prevIcon,
  nextIcon: _nextIcon,
  superPrevIcon: _superPrevIcon,
  superNextIcon: _superNextIcon,

  // Limitation
  minDate,
  maxDate,
  generateConfig,
  locale,
  pickerValue,
  panelType: type,
} = toRefs(usePanelContextInject());

const prevIcon = computed(() => _prevIcon.value || '\u2039');
const nextIcon = computed(() => _nextIcon.value || '\u203A');
const superPrevIcon = computed(() => _superPrevIcon.value || '\u00AB');
const superNextIcon = computed(() => _superNextIcon.value || '\u00BB');

const headerPrefixCls = computed(() => `${prefixCls.value}-header`);

const { hidePrev, hideNext, hideHeader } = toRefs(usePickerHackContextInject());

// ======================= Limitation =======================
const disabledOffsetPrev = computed(() => {
  if (!minDate.value || !offset || !getEnd) {
    return false;
  }

  const prevPanelLimitDate = getEnd(offset(-1, pickerValue.value));

  return !isSameOrAfter(generateConfig.value, locale.value, prevPanelLimitDate, minDate.value, type.value);
});

const disabledSuperOffsetPrev = computed(() => {
  if (!minDate.value || !superOffset || !getEnd) {
    return false;
  }

  const prevPanelLimitDate = getEnd(superOffset(-1, pickerValue.value));

  return !isSameOrAfter(generateConfig.value, locale.value, prevPanelLimitDate, minDate.value, type.value);
});

const disabledOffsetNext = computed(() => {
  if (!maxDate.value || !offset || !getStart) {
    return false;
  }

  const nextPanelLimitDate = getStart(offset(1, pickerValue.value));

  return !isSameOrAfter(generateConfig.value, locale.value, maxDate.value, nextPanelLimitDate, type.value);
});

const disabledSuperOffsetNext = computed(() => {
  if (!maxDate.value || !superOffset || !getStart) {
    return false;
  }

  const nextPanelLimitDate = getStart(superOffset(1, pickerValue.value));

  return !isSameOrAfter(generateConfig.value, locale.value, maxDate.value, nextPanelLimitDate, type.value);
});

// ========================= Offset =========================
const onOffset = (distance: number) => {
  if (offset) {
    onChange(offset(distance, pickerValue.value));
  }
};

const onSuperOffset = (distance: number) => {
  if (superOffset) {
    onChange(superOffset(distance, pickerValue.value));
  }
};

const prevBtnCls = computed(() => `${headerPrefixCls.value}-prev-btn`);
const nextBtnCls = computed(() => `${headerPrefixCls.value}-next-btn`);
const superPrevBtnCls = computed(() => `${headerPrefixCls.value}-super-prev-btn`);
const superNextBtnCls = computed(() => `${headerPrefixCls.value}-super-next-btn`);
</script>
<template>
  <div v-if="!hideHeader" :class="clsx(headerPrefixCls, classNames.header)" :style="styles.header">
    <button
      v-if="superOffset"
      type="button"
      :aria-label="locale.previousYear"
      @click="() => onSuperOffset(-1)"
      :tabindex="-1"
      :class="clsx(superPrevBtnCls, disabledSuperOffsetPrev && `${superPrevBtnCls}-disabled`)"
      :disabled="disabledSuperOffsetPrev"
      :style="hidePrev ? HIDDEN_STYLE : {}"
    >
      <Render :content="superPrevIcon" />
    </button>
    <button
      v-if="offset"
      type="button"
      :aria-label="locale.previousMonth"
      @click="() => onOffset(-1)"
      :tabindex="-1"
      :class="clsx(prevBtnCls, disabledOffsetPrev && `${prevBtnCls}-disabled`)"
      :disabled="disabledOffsetPrev"
      :style="hidePrev ? HIDDEN_STYLE : {}"
    >
      <Render :content="prevIcon" />
    </button>
    <div :class="`${headerPrefixCls}-view`"><slot></slot></div>
    <button
      v-if="offset"
      type="button"
      :aria-label="locale.nextMonth"
      @click="() => onOffset(1)"
      :tabindex="-1"
      :class="clsx(nextBtnCls, disabledOffsetNext && `${nextBtnCls}-disabled`)"
      :disabled="disabledOffsetNext"
      :style="hideNext ? HIDDEN_STYLE : {}"
    >
      <Render :content="nextIcon" />
    </button>
    <button
      v-if="superOffset"
      type="button"
      :aria-label="locale.nextYear"
      @click="() => onSuperOffset(1)"
      :tabindex="-1"
      :class="clsx(superNextBtnCls, disabledSuperOffsetNext && `${superNextBtnCls}-disabled`)"
      :disabled="disabledSuperOffsetNext"
      :style="hideNext ? HIDDEN_STYLE : {}"
    >
      <Render :content="superNextIcon" />
    </button>
  </div>
</template>
