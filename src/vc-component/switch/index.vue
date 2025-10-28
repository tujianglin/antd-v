<script lang="tsx" setup>
import Render from '@/vc-component/render';
import KeyCode from '@/vc-util/KeyCode';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { computed, type CSSProperties, type HTMLAttributes } from 'vue';
export type SwitchChangeEventHandler = (checked: boolean | string | number, event: MouseEvent | KeyboardEvent) => void;
export type SwitchClickEventHandler = SwitchChangeEventHandler;

interface SwitchProps extends /** @vue-ignore */ Omit<HTMLAttributes, 'onChange' | 'onClick'> {
  class?: string;
  prefixCls?: string;
  disabled?: boolean;
  checkedChildren?: VueNode;
  unCheckedChildren?: VueNode;
  onChange?: SwitchChangeEventHandler;
  onKeydown?: (e: KeyboardEvent) => void;
  onClick?: SwitchClickEventHandler;
  tabindex?: number;
  loadingIcon?: VueNode;
  style?: CSSProperties;
  title?: string;
  styles?: { content: CSSProperties };
  classNames?: { content: string };
}
defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls = 'rc-switch',
  class: className,
  disabled,
  loadingIcon,
  checkedChildren,
  unCheckedChildren,
  onClick,
  onChange,
  onKeydown,
  styles,
  classNames: switchClassNames,
  ...restProps
} = defineProps<SwitchProps>();

const innerChecked = defineModel<boolean | string | number>('checked', { default: false });

function triggerChange(newChecked: boolean, event: MouseEvent | KeyboardEvent) {
  let mergedChecked = innerChecked.value;

  if (!disabled) {
    mergedChecked = newChecked;
    innerChecked.value = mergedChecked;
    onChange?.(mergedChecked, event);
  }

  return mergedChecked;
}
function onInternalKeyDown(e: KeyboardEvent) {
  if (e.which === KeyCode.LEFT) {
    triggerChange(false, e);
  } else if (e.which === KeyCode.RIGHT) {
    triggerChange(true, e);
  }
  onKeydown?.(e);
}

function onInternalClick(e: MouseEvent) {
  const ret = triggerChange(!innerChecked.value, e);
  // [Legacy] trigger onClick with value
  onClick?.(ret, e);
}

const switchClassName = computed(() => {
  return clsx(prefixCls, className, {
    [`${prefixCls}-checked`]: innerChecked.value,
    [`${prefixCls}-disabled`]: disabled,
  });
});
</script>
<template>
  <button
    v-bind="{ ...restProps, ...$attrs }"
    type="button"
    role="switch"
    :aria-checked="!!innerChecked"
    :disabled="disabled"
    :class="switchClassName"
    @keydown="onInternalKeyDown"
    @click="onInternalClick"
  >
    <slot name="loadingIcon">
      <Render :content="loadingIcon" />
    </slot>
    <span :class="`${prefixCls}-inner`">
      <span :class="clsx(`${prefixCls}-inner-checked`, switchClassNames?.content)" :style="styles?.content">
        <slot name="checkedChildren">
          <Render :content="checkedChildren" />
        </slot>
      </span>
      <span :class="clsx(`${prefixCls}-inner-unchecked`, switchClassNames?.content)" :style="styles?.content">
        <slot name="unCheckedChildren">
          <Render :content="unCheckedChildren" />
        </slot>
      </span>
    </span>
  </button>
</template>
