<script lang="tsx" setup>
import type { GenerateConfig } from '@/vc-component/picker/generate';
import type { Locale } from '@/vc-component/picker/interface';
import clsx from 'clsx';
import { omit } from 'lodash-es';
import { computed, getCurrentInstance, ref, type CSSProperties, type Ref } from 'vue';
import { FormItemInputContextProvider, useFormItemInputContextInject } from '../../form/context';
import type { CalendarMode, DateType, SelectInfo } from '../CalendarPanel.vue';
import ModeSwitch from './ModeSwitch.vue';
import MonthSelect from './MonthSelect.vue';
import YearSelect from './YearSelect.vue';

export interface SharedProps {
  prefixCls: string;
  value: DateType;
  validRange?: [DateType, DateType];
  generateConfig: GenerateConfig<DateType>;
  locale: Locale;
  fullscreen: boolean;
  divRef: Ref<HTMLDivElement>;
  onChange: (year: DateType) => void;
}

export interface CalendarHeaderProps<DateType> {
  class?: string;
  style?: CSSProperties;
  prefixCls: string;
  value: DateType;
  validRange?: [DateType, DateType];
  generateConfig: GenerateConfig<DateType>;
  locale: Locale;
  mode: CalendarMode;
  fullscreen: boolean;
  onChange: (date: DateType, source: SelectInfo['source']) => void;
  onModeChange: (mode: CalendarMode) => void;
}
const { prefixCls, fullscreen, mode, onChange, onModeChange, class: className, style } = defineProps<CalendarHeaderProps<any>>();
const divRef = ref<HTMLDivElement>(null!);

const formItemInputContext = useFormItemInputContextInject();
const mergedFormItemInputContext = computed(() => ({
  ...formItemInputContext,
  isFormItemInput: false,
}));

const vm = getCurrentInstance();

const sharedProps = computed(() => ({
  ...vm.props,
  fullscreen,
  divRef,
}));
</script>
<template>
  <div :class="clsx(`${prefixCls}-header`, className)" :style="style" ref="divRef">
    <FormItemInputContextProvider :value="mergedFormItemInputContext">
      <YearSelect
        v-bind="{...omit(sharedProps, ['onChange']) as any}"
        @change="
          (v) => {
            onChange(v, 'year');
          }
        "
      />
      <MonthSelect
        v-if="mode === 'month'"
        v-bind="{...omit(sharedProps, ['onChange']) as any}"
        @change="
          (v) => {
            onChange(v, 'month');
          }
        "
      />
    </FormItemInputContextProvider>
    <ModeSwitch v-bind="{...omit(sharedProps, ['onModeChange']) as any}" @mode-change="onModeChange" />
  </div>
</template>
