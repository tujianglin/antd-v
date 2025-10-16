<script lang="tsx" setup>
import { computed, onMounted, ref, type CSSProperties } from 'vue';
import type { StarProps } from './Star.vue';
import Star from './Star.vue';
import useRefs from './useRefs';
import { getOffsetLeft } from './util';
import KeyCode from '@/vc-util/KeyCode';
import clsx from 'clsx';
import pickAttrs from '@/vc-util/pickAttrs';
import Render from '@/vc-component/render';

export interface RateProps extends Pick<StarProps, 'count' | 'character' | 'characterRender' | 'allowHalf' | 'disabled'> {
  allowClear?: boolean;
  style?: CSSProperties;
  prefixCls?: string;
  onChange?: (value: number) => void;
  onHoverChange?: (value: number) => void;
  class?: string;
  tabindex?: number;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeydown?: (e: KeyboardEvent) => void;
  onMouseenter?: (e: MouseEvent) => void;
  onMouseleave?: (e: MouseEvent) => void;
  id?: string;
  autofocus?: boolean;
  direction?: string;
  /**
   * Is keyboard control enabled.
   * @default true
   */
  keyboard?: boolean;
}

export interface RateRef {
  focus: VoidFunction;
  blur: VoidFunction;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  // Base
  prefixCls = 'rc-rate',
  class: className,

  // Value
  count = 5,
  allowHalf = false,
  allowClear = true,
  keyboard = true,

  // Display
  character,
  characterRender,

  // Meta
  disabled,
  direction = 'ltr',
  tabindex = 0,
  autofocus,

  // Events
  onHoverChange,
  onChange,
  onFocus,
  onBlur,
  onKeydown,
  onMouseleave,

  ...restProps
} = defineProps<RateProps>();

const [getStarRef, setStarRef] = useRefs<any>();
const rateRef = ref<HTMLUListElement>(null);

// ============================ Ref =============================
const triggerFocus = () => {
  if (!disabled) {
    rateRef.value?.focus();
  }
};

defineExpose({
  focus: () => {
    triggerFocus();
  },
  blur: () => {
    if (!disabled) {
      rateRef.value?.blur();
    }
  },
});

// =========================== Value ============================
const value = defineModel('value', { default: 0 });
const cleanedValue = ref<number | null>(null);

const getStarValue = (index: number, x: number) => {
  const reverse = direction === 'rtl';
  let starValue = index + 1;
  if (allowHalf) {
    const starEle = getStarRef(index);
    const leftDis = getOffsetLeft(starEle);
    const width = starEle.clientWidth;
    if (reverse && x - leftDis > width / 2) {
      starValue -= 0.5;
    } else if (!reverse && x - leftDis < width / 2) {
      starValue -= 0.5;
    }
  }
  return starValue;
};

// >>>>> Change
const changeValue = (nextValue: number) => {
  value.value = nextValue;
  onChange?.(nextValue);
};

// =========================== Focus ============================
const focused = ref(false);

const onInternalFocus = () => {
  focused.value = true;
  onFocus?.();
};

const onInternalBlur = () => {
  focused.value = false;
  onBlur?.();
};

// =========================== Hover ============================
const hoverValue = ref<number | null>(null);

const onHover = (event: MouseEvent, index: number) => {
  const nextHoverValue = getStarValue(index, event.pageX);
  if (nextHoverValue !== cleanedValue.value) {
    hoverValue.value = nextHoverValue;
    cleanedValue.value = null;
  }
  onHoverChange?.(nextHoverValue);
};

const onMouseLeaveCallback = (event?: MouseEvent) => {
  if (!disabled) {
    hoverValue.value = null;
    cleanedValue.value = null;
    onHoverChange?.(undefined);
  }
  if (event) {
    onMouseleave?.(event);
  }
};

// =========================== Click ============================
const onClick = (event: MouseEvent | KeyboardEvent, index: number) => {
  const newValue = getStarValue(index, (event as MouseEvent).pageX);
  let isReset = false;
  if (allowClear) {
    isReset = newValue === value.value;
  }
  onMouseLeaveCallback();
  changeValue(isReset ? 0 : newValue);
  cleanedValue.value = isReset ? newValue : null;
};

const onInternalKeyDown = (event) => {
  const { keyCode } = event;
  const reverse = direction === 'rtl';
  const step = allowHalf ? 0.5 : 1;

  if (keyboard) {
    if (keyCode === KeyCode.RIGHT && value.value < count && !reverse) {
      changeValue(value.value + step);
      event.preventDefault();
    } else if (keyCode === KeyCode.LEFT && value.value > 0 && !reverse) {
      changeValue(value.value - step);
      event.preventDefault();
    } else if (keyCode === KeyCode.RIGHT && value.value > 0 && reverse) {
      changeValue(value.value - step);
      event.preventDefault();
    } else if (keyCode === KeyCode.LEFT && value.value < count && reverse) {
      changeValue(value.value + step);
      event.preventDefault();
    }
  }

  onKeydown?.(event);
};

// =========================== Effect ===========================

onMounted(() => {
  if (autofocus && !disabled) {
    triggerFocus();
  }
});

// =========================== Render ===========================
// >>> Star
const starNodes = () => {
  return Array.from({ length: count })
    .fill(0)
    .map((item: any, index) => (
      <Star
        ref={setStarRef(index)}
        index={index}
        count={count}
        disabled={disabled}
        prefixCls={`${prefixCls}-star`}
        allowHalf={allowHalf}
        value={hoverValue.value === null ? value.value : hoverValue.value}
        onClick={onClick}
        onHover={onHover}
        key={item || index}
        character={character || '*'}
        characterRender={characterRender}
        focused={focused.value}
      />
    ));
};

const classString = computed(() => {
  return clsx(prefixCls, className, {
    [`${prefixCls}-disabled`]: disabled,
    [`${prefixCls}-rtl`]: direction === 'rtl',
  });
});
</script>
<template>
  <ul
    :class="classString"
    @mouseleave="onMouseLeaveCallback"
    :tabindex="disabled ? -1 : tabindex"
    @focus="() => (disabled ? null : onInternalFocus())"
    @blur="() => (disabled ? null : onInternalBlur())"
    @keydown="(e) => (disabled ? null : onInternalKeyDown(e))"
    ref="rateRef"
    v-bind="pickAttrs(restProps, { aria: true, data: true, attr: true })"
  >
    <Render :content="starNodes" />
  </ul>
</template>
