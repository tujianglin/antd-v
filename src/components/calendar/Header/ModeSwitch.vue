<script lang="tsx" setup>
import { computed } from 'vue';
import Radio from '../../radio';
import type { CalendarMode } from '../CalendarPanel.vue';
import type { SharedProps } from './index.vue';
interface ModeSwitchProps extends Omit<SharedProps, 'onChange'> {
  mode: CalendarMode;
  onModeChange: (type: CalendarMode) => void;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, locale, mode, fullscreen, onModeChange } = defineProps<ModeSwitchProps>();

const options = computed(() => [
  {
    label: locale.month,
    value: 'month',
  },
  {
    label: locale.year,
    value: 'year',
  },
]);
</script>
<template>
  <Radio.Group
    option-type="button"
    @change="
      ({ target: { value } }) => {
        onModeChange(value);
      }
    "
    :value="mode"
    :size="fullscreen ? undefined : 'small'"
    :class="`${prefixCls}-mode-switch`"
    :options="options"
  />
</template>
