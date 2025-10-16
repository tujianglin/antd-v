<script lang="tsx" setup>
import KeyCode from '@/vc-util/KeyCode';
import { computed, ref } from 'vue';
import type { PaginationLocale } from './interface';
import Render from '@/vc-component/render';

export type SizeChangerRender = (info: {
  disabled: boolean;
  size: number;
  onSizeChange: (value: string | number) => void;
  'aria-label': string;
  className: string;
  options: {
    label: string;
    value: string | number;
  }[];
}) => any;

interface OptionsProps {
  disabled?: boolean;
  locale: PaginationLocale;
  rootPrefixCls: string;
  selectPrefixCls?: string;
  pageSize: number;
  pageSizeOptions?: number[];
  goButton?: () => boolean | string;
  changeSize?: (size: number) => void;
  quickGo?: (value: number) => void;
  buildOptionText?: (value: number | string) => string;
  showSizeChanger: boolean;
  sizeChangerRender?: SizeChangerRender;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });
const {
  pageSizeOptions = [10, 20, 50, 100],
  locale,
  changeSize,
  pageSize,
  goButton,
  quickGo,
  rootPrefixCls,
  disabled,
  buildOptionText,
  showSizeChanger,
  sizeChangerRender,
} = defineProps<OptionsProps>();

const goInputText = ref('');

const getValidValue = computed<number>(() => {
  return !goInputText.value || Number.isNaN(goInputText.value) ? undefined : Number(goInputText.value);
});

const mergeBuildOptionText = computed(() =>
  typeof buildOptionText === 'function' ? buildOptionText : (value: string | number) => `${value} ${locale.items_per_page}`,
);

const handleChange = (e) => {
  goInputText.value = e.target.value;
};

const handleBlur = (e: FocusEvent) => {
  if (goButton() || goInputText.value === '') {
    return;
  }
  goInputText.value = '';
  if (
    e.relatedTarget &&
    ((e.relatedTarget as HTMLDivElement).className.includes(`${rootPrefixCls}-item-link`) ||
      (e.relatedTarget as HTMLDivElement).className.includes(`${rootPrefixCls}-item`))
  ) {
    return;
  }
  quickGo?.(getValidValue.value);
};

const go = (e: any) => {
  if (goInputText.value === '') {
    return;
  }
  if (e.keyCode === KeyCode.ENTER || e.type === 'click') {
    goInputText.value = '';
    quickGo?.(getValidValue.value);
  }
};

const getPageSizeOptions = () => {
  if (pageSizeOptions.some((option) => option.toString() === pageSize.toString())) {
    return pageSizeOptions;
  }
  return pageSizeOptions.concat([pageSize]).sort((a, b) => {
    const numberA = Number.isNaN(Number(a)) ? 0 : Number(a);
    const numberB = Number.isNaN(Number(b)) ? 0 : Number(b);
    return numberA - numberB;
  });
};
// ============== cls ==============
const prefixCls = computed(() => `${rootPrefixCls}-options`);

// ============== render ==============

const changeSelect = () => {
  let result = null;
  // >>>>> Size Changer
  if (showSizeChanger && sizeChangerRender) {
    result = sizeChangerRender({
      disabled,
      size: pageSize,
      onSizeChange: (nextValue) => {
        changeSize?.(Number(nextValue));
      },
      'aria-label': locale.page_size,
      className: `${prefixCls.value}-size-changer`,
      options: getPageSizeOptions().map((opt) => ({
        label: mergeBuildOptionText.value(opt),
        value: opt,
      })),
    });
  }
  return result;
};
const gotoButton = () => {
  let result = null;
  if (quickGo) {
    if (goButton()) {
      result =
        typeof goButton() === 'boolean' ? (
          <button type="button" onClick={go} onKeyup={go} disabled={disabled} class={`${prefixCls.value}-quick-jumper-button`}>
            {locale.jump_to_confirm}
          </button>
        ) : (
          <span onClick={go} onKeyup={go}>
            <Render content={goButton}></Render>
          </span>
        );
    }
  }
  return result;
};
const goInput = () => {
  let result = null;
  if (quickGo) {
    result = (
      <div class={`${prefixCls.value}-quick-jumper`}>
        {locale.jump_to}
        <input
          disabled={disabled}
          type="text"
          value={goInputText.value}
          onChange={handleChange}
          onKeyup={go}
          onBlur={handleBlur}
          aria-label={locale.page}
        />
        {locale.page}
        <Render content={gotoButton}></Render>
      </div>
    );
  }
  return result;
};
</script>
<template>
  <template v-if="!showSizeChanger && !quickGo"></template>
  <li v-else :class="prefixCls">
    <Render :content="changeSelect" />
    <Render :content="goInput" />
  </li>
</template>
