<script lang="tsx" setup generic="DateType extends object = any">
import { reactiveComputed } from '@vueuse/core';
import clsx from 'clsx';
import { computed, getCurrentInstance } from 'vue';
import type { SharedPanelProps } from '../../interface';
import { formatValue } from '../../utils/dateUtil';
import { PanelContextProvider, useInfo } from '../context';
import PanelHeader from '../PanelHeader.vue';
import TimePanelBody from './TimePanelBody/index.vue';

export type TimePanelProps<DateType extends object> = SharedPanelProps<DateType>;

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  value,
  locale,
  generateConfig,

  // Format
  showTime,
} = defineProps<TimePanelProps<DateType>>();

const format = computed(() => showTime?.format);

const panelPrefixCls = computed(() => `${prefixCls}-time-panel`);

const vm = getCurrentInstance();
// ========================== Base ==========================
const [info] = useInfo(
  reactiveComputed(() => vm.props as any),
  computed(() => 'time'),
);
</script>
<template>
  <PanelContextProvider :value="info">
    <div :class="clsx(panelPrefixCls)">
      <PanelHeader>
        {{
          value
            ? formatValue(value, {
                locale,
                format,
                generateConfig,
              })
            : '\u00A0'
        }}
      </PanelHeader>
      <TimePanelBody v-bind="showTime" />
    </div>
  </PanelContextProvider>
</template>
