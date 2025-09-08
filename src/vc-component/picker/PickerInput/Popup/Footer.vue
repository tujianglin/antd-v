<script lang="tsx" setup>
import { Render } from '@/components';
import clsx from 'clsx';
import { computed, toRefs } from 'vue';
import type { GenerateConfig } from '../../generate';
import useTimeInfo from '../../hooks/useTimeInfo';
import type { DisabledDate, InternalMode, PanelMode, SharedPickerProps } from '../../interface';
import { usePickerContextInject } from '../context';
import type { PopupShowTimeConfig } from './index.vue';

export interface FooterProps<DateType extends object = any> {
  mode: PanelMode;
  internalMode: InternalMode;
  renderExtraFooter?: SharedPickerProps['renderExtraFooter'];
  showNow: boolean;
  generateConfig: GenerateConfig<DateType>;
  disabledDate: DisabledDate<DateType>;
  showTime?: PopupShowTimeConfig<DateType>;

  // Invalid
  /** From Footer component used only. Check if can OK button click */
  invalid?: boolean;

  // Submit
  onSubmit: (date?: DateType) => void;
  needConfirm: boolean;

  // Now
  onNow: (now: DateType) => void;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  mode,
  internalMode,
  renderExtraFooter,
  showNow,
  showTime,
  onSubmit,
  onNow,
  invalid,
  needConfirm,
  generateConfig,
  disabledDate,
} = defineProps<FooterProps>();

const { prefixCls, locale, button, classNames, styles } = toRefs(usePickerContextInject());

const Button = computed(() => button.value || 'button');

// >>> Now
const now = computed(() => generateConfig.getNow());

const [getValidTime] = useTimeInfo(
  computed(() => generateConfig),
  computed(() => showTime),
  now,
);

// ======================== Extra =========================
const extraNode = computed(() => renderExtraFooter?.(mode));

// ======================== Ranges ========================
const nowDisabled = computed(() => disabledDate(now.value, { type: mode }));

const onInternalNow = () => {
  if (!nowDisabled.value) {
    const validateNow = getValidTime(now.value);
    onNow(validateNow);
  }
};

const nowPrefixCls = computed(() => `${prefixCls.value}-now`);
const nowBtnPrefixCls = computed(() => `${nowPrefixCls.value}-btn`);
</script>
<template>
  <template v-if="!extraNode && !showNow && !needConfirm"></template>
  <div v-else :class="clsx(`${prefixCls}-footer`, classNames.popup.footer)" :style="styles.popup.footer">
    <div v-if="extraNode" :class="`${prefixCls}-footer-extra`">
      <Render :content="extraNode" />
    </div>
    <ul :class="`${prefixCls}-ranges`">
      <li v-if="showNow" :class="nowPrefixCls">
        <a
          :class="clsx(nowBtnPrefixCls, nowDisabled && `${nowBtnPrefixCls}-disabled`)"
          :aria-disabled="nowDisabled"
          @click="onInternalNow"
        >
          {{ internalMode === 'date' ? locale.today : locale.now }}
        </a>
      </li>
      <li v-if="needConfirm" :class="`${prefixCls}-ok`">
        <component :is="Button" :disabled="invalid" @click="onSubmit">
          {{ locale.ok }}
        </component>
      </li>
    </ul>
  </div>
</template>
