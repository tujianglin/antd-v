<script lang="tsx" setup generic="DateType extends object = any">
import { omit } from 'lodash-es';
import { computed, getCurrentInstance, toRefs } from 'vue';
import { PickerPanel } from '../..';
import { PickerHackContextProvider, type PickerHackContextProps } from '../../PickerPanel/context';
import { type PickerPanelProps } from '../../PickerPanel/index.vue';
import { usePickerContextInject } from '../context';
import { offsetPanelDate } from '../hooks/useRangePickerValue';
import { type FooterProps } from './Footer.vue';

export type MustProp<DateType extends object> = Required<Pick<PickerPanelProps<DateType>, 'mode' | 'onPanelChange'>>;

export type PopupPanelProps<DateType extends object = any> = MustProp<DateType> &
  Omit<PickerPanelProps<DateType>, 'onPickerValueChange' | 'showTime'> &
  FooterProps<DateType> & {
    multiplePanel?: boolean;
    range?: boolean;

    onPickerValueChange: (date: DateType) => void;
  };

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { picker, multiplePanel, pickerValue, onPickerValueChange, needConfirm, onSubmit, range, hoverValue } =
  defineProps<PopupPanelProps<DateType>>();

const { prefixCls, generateConfig } = toRefs(usePickerContextInject());

// ======================== Offset ========================
const internalOffsetDate = (date: DateType, offset: number) => {
  return offsetPanelDate(generateConfig.value, picker, date, offset);
};

const nextPickerValue = computed(() => internalOffsetDate(pickerValue, 1));

// Outside
const onSecondPickerValueChange = (nextDate: DateType) => {
  onPickerValueChange(internalOffsetDate(nextDate, -1));
};

// ======================= Context ========================
const sharedContext = computed<PickerHackContextProps>(() => ({
  onCellDblClick: () => {
    if (needConfirm) {
      onSubmit();
    }
  },
}));

const hideHeader = computed(() => picker === 'time');

const vm = getCurrentInstance();

// ======================== Props =========================
const pickerProps = computed(() => {
  const result = {
    ...vm.props,
    hoverValue: null,
    hoverRangeValue: null,
    hideHeader: hideHeader.value,
  };

  if (range) {
    result.hoverRangeValue = hoverValue;
  } else {
    result.hoverValue = hoverValue;
  }
  return result as any;
});
</script>
<template>
  <div v-if="multiplePanel" :class="`${prefixCls}-panels`">
    <PickerHackContextProvider :value="{ ...sharedContext, hideNext: true }">
      <PickerPanel v-bind="pickerProps" />
    </PickerHackContextProvider>
    <PickerHackContextProvider :value="{ ...sharedContext, hidePrev: true }">
      <PickerPanel
        v-bind="{...omit(pickerProps, 'onPickerValueChange') as any}"
        :picker-value="nextPickerValue"
        @picker-value-change="onSecondPickerValueChange"
      />
    </PickerHackContextProvider>
  </div>
  <PickerHackContextProvider v-else :value="sharedContext"> <PickerPanel v-bind="pickerProps" /> </PickerHackContextProvider>
</template>
