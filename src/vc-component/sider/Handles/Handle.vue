<script lang="tsx" setup>
import KeyCode from '@/vc-util/KeyCode';
import { computed, ref, toRefs, type CSSProperties, type HTMLAttributes, type HtmlHTMLAttributes } from 'vue';
import { useSliderContextInject } from '../context';
import type { OnStartMove } from '../interface';
import { getDirectionStyle, getIndex } from '../util';
import clsx from 'clsx';
interface RenderProps {
  index: number;
  prefixCls: string;
  value: number;
  dragging: boolean;
  draggingDelete: boolean;
}

export interface HandleProps extends /** @vue-ignore */ Omit<HTMLAttributes, 'onFocus' | 'onMouseEnter'> {
  prefixCls: string;
  style?: CSSProperties;
  value: number;
  valueIndex: number;
  dragging: boolean;
  draggingDelete: boolean;
  onStartMove: OnStartMove;
  onDelete?: (index: number) => void;
  onOffsetChange: (value: number | 'min' | 'max', valueIndex: number) => void;
  onFocus: (e: FocusEvent, index: number) => void;
  onMouseEnter: (e: MouseEvent, index: number) => void;
  render?: (origin: any, props: RenderProps) => any;
  onChangeComplete?: () => void;
  mock?: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  value,
  valueIndex,
  onStartMove,
  onDelete,
  style,
  render,
  dragging,
  draggingDelete,
  onOffsetChange,
  onChangeComplete,
  onFocus,
  onMouseEnter,
  ...restProps
} = defineProps<HandleProps>();

const {
  min,
  max,
  direction,
  disabled,
  keyboard,
  range,
  tabIndex,
  ariaLabelForHandle,
  ariaLabelledByForHandle,
  ariaRequired,
  ariaValueTextFormatterForHandle,
  styles,
  classNames,
} = toRefs(useSliderContextInject());

const handlePrefixCls = `${prefixCls}-handle`;

// ============================ Events ============================
const onInternalStartMove = (e: MouseEvent | TouchEvent) => {
  if (!disabled.value) {
    onStartMove(e, valueIndex);
  }
};

const onInternalFocus = (e: FocusEvent) => {
  onFocus?.(e, valueIndex);
};

const onInternalMouseEnter = (e: MouseEvent) => {
  onMouseEnter(e, valueIndex);
};

// =========================== Keyboard ===========================
const onKeyDown = (e: KeyboardEvent) => {
  if (!disabled.value && keyboard.value) {
    let offset: number | 'min' | 'max' = null;

    // Change the value
    switch (e.which || e.keyCode) {
      case KeyCode.LEFT:
        offset = direction.value === 'ltr' || direction.value === 'btt' ? -1 : 1;
        break;

      case KeyCode.RIGHT:
        offset = direction.value === 'ltr' || direction.value === 'btt' ? 1 : -1;
        break;

      // Up is plus
      case KeyCode.UP:
        offset = direction.value !== 'ttb' ? 1 : -1;
        break;

      // Down is minus
      case KeyCode.DOWN:
        offset = direction.value !== 'ttb' ? -1 : 1;
        break;

      case KeyCode.HOME:
        offset = 'min';
        break;

      case KeyCode.END:
        offset = 'max';
        break;

      case KeyCode.PAGE_UP:
        offset = 2;
        break;

      case KeyCode.PAGE_DOWN:
        offset = -2;
        break;

      case KeyCode.BACKSPACE:
      case KeyCode.DELETE:
        onDelete?.(valueIndex);
        break;
    }

    if (offset !== null) {
      e.preventDefault();
      onOffsetChange(offset, valueIndex);
    }
  }
};

const handleKeyUp = (e: KeyboardEvent) => {
  switch (e.which || e.keyCode) {
    case KeyCode.LEFT:
    case KeyCode.RIGHT:
    case KeyCode.UP:
    case KeyCode.DOWN:
    case KeyCode.HOME:
    case KeyCode.END:
    case KeyCode.PAGE_UP:
    case KeyCode.PAGE_DOWN:
      onChangeComplete?.();
      break;
  }
};

// ============================ Offset ============================
const positionStyle = computed(() => getDirectionStyle(direction.value, value, min.value, max.value));

// ============================ Render ============================
const divProps = computed(() => {
  let result: HtmlHTMLAttributes = {};

  if (valueIndex !== null) {
    result = {
      tabindex: disabled.value ? null : getIndex(tabIndex.value, valueIndex),
      role: 'slider',
      'aria-valuemin': min.value,
      'aria-valuemax': max.value,
      'aria-valuenow': value,
      'aria-disabled': disabled.value,
      'aria-label': getIndex(ariaLabelForHandle.value, valueIndex),
      'aria-labelledby': getIndex(ariaLabelledByForHandle.value, valueIndex),
      'aria-required': getIndex(ariaRequired.value, valueIndex),
      'aria-valuetext': getIndex(ariaValueTextFormatterForHandle.value, valueIndex)?.(value),
      'aria-orientation': direction.value === 'ltr' || direction.value === 'rtl' ? 'horizontal' : 'vertical',
      onMousedown: onInternalStartMove,
      onTouchstart: onInternalStartMove,
      onFocus: onInternalFocus,
      onMouseenter: onInternalMouseEnter,
      onKeydown: onKeyDown,
      onKeyup: handleKeyUp,
    };
  }
  return result;
});
const domRef = ref(null);

defineExpose({
  get el() {
    return domRef.value;
  },
});
const HandleNode = () => {
  let handleNode = (
    <div
      ref={domRef}
      class={clsx(
        handlePrefixCls,
        {
          [`${handlePrefixCls}-${valueIndex + 1}`]: valueIndex !== null && range.value,
          [`${handlePrefixCls}-dragging`]: dragging,
          [`${handlePrefixCls}-dragging-delete`]: draggingDelete,
        },
        classNames.value?.handle,
      )}
      style={{
        ...positionStyle.value,
        ...style,
        ...styles.value?.handle,
      }}
      {...divProps.value}
      {...restProps}
    />
  );

  // Customize
  if (render) {
    handleNode = render(handleNode, {
      index: valueIndex,
      prefixCls,
      value,
      dragging,
      draggingDelete,
    });
  }

  return handleNode;
};
</script>
<template>
  <HandleNode />
</template>
