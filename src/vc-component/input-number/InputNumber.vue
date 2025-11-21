<script lang="tsx" setup>
import { triggerFocus, type InputFocusOptions } from '@/vc-util/Dom/focus';
import type { VueNode } from '@/vc-util/type';
import { watchOnce } from '@vueuse/core';
import clsx from 'clsx';
import { computed, onBeforeUnmount, ref, useTemplateRef, watch, type CSSProperties, type InputHTMLAttributes } from 'vue';
import type { DecimalClass, ValueType } from '../mini-decimal';
import getMiniDecimal, { getNumberPrecision, num2str, toFixed, validateNumber } from '../mini-decimal';
import Render from '../render';
import useCursor from './hooks/useCursor';
import useFrame from './hooks/useFrame';
import StepHandler from './StepHandler.vue';
import { getDecupleSteps } from './utils/numberUtil';
type SemanticName = 'root' | 'actions' | 'input' | 'action' | 'prefix' | 'suffix';
export interface InputNumberProps
  extends /* @vue-ignore */ Omit<
    InputHTMLAttributes,
    | 'value'
    | 'onInput'
    | 'onChange'
    | 'prefix'
    | 'suffix'
    | 'onMousedown'
    | 'onClick'
    | 'onMouseup'
    | 'onMouseleave'
    | 'onMousemove'
    | 'onMouseenter'
    | 'onMouseout'
  > {
  disabled?: boolean;
  readonly?: boolean;
  /** value will show as string */
  stringMode?: boolean;

  mode?: 'input' | 'spinner';

  prefixCls?: string;
  class?: string;
  style?: CSSProperties;
  min?: ValueType;
  max?: ValueType;
  step?: ValueType;
  tabindex?: number;
  controls?: boolean;
  prefix?: VueNode;
  suffix?: VueNode;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;

  // Customize handler node
  upHandler?: VueNode;
  downHandler?: VueNode;
  keyboard?: boolean;
  changeOnWheel?: boolean;

  /** Parse display value to validate number */
  parser?: (displayValue: string | undefined) => ValueType;
  /** Transform `value` to display value show in input */
  formatter?: (value: ValueType | undefined, info: { userTyping: boolean; input: string }) => string;
  /** Syntactic sugar of `formatter`. Config precision of display. */
  precision?: number;
  /** Syntactic sugar of `formatter`. Config decimal separator of display. */
  decimalSeparator?: string;

  onInput?: (text: string) => void;
  onChange?: (value: ValueType | null) => void;
  onPressEnter?: (e: KeyboardEvent) => void;

  onStep?: (
    value: ValueType,
    info: { offset: ValueType; type: 'up' | 'down'; emitter: 'handler' | 'keyboard' | 'wheel' },
  ) => void;

  /**
   * Trigger change onBlur event.
   * If disabled, user must press enter or click handler to confirm the value update
   */
  changeOnBlur?: boolean;

  onMousedown?: (e: MouseEvent) => void;
  onClick?: (e: MouseEvent) => void;
  onMouseup?: (e: MouseEvent) => void;
  onMouseleave?: (e: MouseEvent) => void;
  onMousemove?: (e: MouseEvent) => void;
  onMouseenter?: (e: MouseEvent) => void;
  onMouseout?: (e: MouseEvent) => void;
}
defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });
const {
  mode = 'input',
  prefixCls = 'rc-input-number',
  class: className,
  style,
  classNames,
  styles,
  min,
  max,
  step = 1,
  disabled,
  readonly,
  upHandler,
  downHandler,
  keyboard,
  changeOnWheel = false,
  controls = true,

  prefix,
  suffix,
  stringMode,

  parser,
  formatter,
  precision,
  decimalSeparator,

  onChange,
  onInput,
  onPressEnter,
  onStep,

  // Mouse Events
  onMousedown,
  onClick,
  onMouseup,
  onMouseleave,
  onMousemove,
  onMouseenter,
  onMouseout,

  changeOnBlur = true,
  ...restProps
} = defineProps<InputNumberProps>();

const value = defineModel<ValueType>('value');

const focus = ref(false);

const userTypingRef = ref(false);
const compositionRef = ref(false);
const shiftKeyRef = ref(false);

// ============================= Refs =============================
const rootRef = useTemplateRef('rootRef');
const inputRef = useTemplateRef('inputRef');

defineExpose({
  focus: (option?: InputFocusOptions) => {
    triggerFocus(inputRef.value, option);
  },
  blur: () => {
    inputRef.value?.blur();
  },
  get nativeElement() {
    return rootRef.value;
  },
});

const decimalValue = ref(getMiniDecimal(value.value));

function setUncontrolledDecimalValue(newDecimal: DecimalClass) {
  if (value.value === undefined) {
    decimalValue.value = newDecimal;
  }
}

// ====================== Parser & Formatter ======================
/**
 * `precision` is used for formatter & onChange.
 * It will auto generate by `value` & `step`.
 * But it will not block user typing.
 *
 * Note: Auto generate `precision` is used for legacy logic.
 * We should remove this since we already support high precision with BigInt.
 *
 * @param number  Provide which number should calculate precision
 * @param userTyping  Change by user typing
 */
function getPrecision(numStr: string, userTyping: boolean) {
  if (userTyping) {
    return undefined;
  }
  if (precision >= 0) {
    return precision;
  }
  return Math.max(getNumberPrecision(numStr), getNumberPrecision(step));
}

// >>> Parser
function mergedParser(num: string | number) {
  const numStr = String(num);

  if (parser) {
    return parser(numStr);
  }

  let parsedStr = numStr;
  if (decimalSeparator) {
    parsedStr = parsedStr.replace(decimalSeparator, '.');
  }

  // [Legacy] We still support auto convert `$ 123,456` to `123456`
  return parsedStr.replace(/[^\w.-]+/g, '');
}

// >>> Formatter
const inputValueRef = ref<string | number>('');
function mergedFormatter(number: string, userTyping: boolean) {
  if (formatter) {
    return formatter(number, { userTyping, input: String(inputValueRef.value) });
  }
  let str = typeof number === 'number' ? num2str(number) : number;
  // User typing will not auto format with precision directly
  if (!userTyping) {
    const mergedPrecision = getPrecision(str, userTyping);
    if (validateNumber(str) && (decimalSeparator || mergedPrecision >= 0)) {
      // Separator
      const separatorStr = decimalSeparator || '.';

      str = toFixed(str, separatorStr, mergedPrecision);
    }
  }
  return str;
}
// ========================== InputValue ==========================
/**
 * Input text value control
 *
 * User can not update input content directly. It update with follow rules by priority:
 *  1. controlled `value` changed
 *    * [SPECIAL] Typing like `1.` should not immediately convert to `1`
 *  2. User typing with format (not precision)
 *  3. Blur or Enter trigger revalidate
 */
const inputValue = ref<string | number>('');

watchOnce(
  value,
  (val) => {
    const initValue = val;
    if (decimalValue.value.isInvalidate() && ['string', 'number'].includes(typeof initValue)) {
      inputValue.value = Number.isNaN(initValue) ? '' : initValue;
    }
    inputValue.value = mergedFormatter(decimalValue.value.toString(), false);
    inputValueRef.value = inputValue.value;
  },
  { immediate: true },
);
// Should always be string
function setInputValue(newValue: DecimalClass, userTyping: boolean) {
  inputValue.value = mergedFormatter(
    // Invalidate number is sometime passed by external control, we should let it go
    // Otherwise is controlled by internal interactive logic which check by userTyping
    // You can ref 'show limited value when input is not focused' test for more info.
    newValue.isInvalidate() ? newValue.toString(false) : newValue.toString(!userTyping),
    userTyping,
  );
}

const getDecimalIfValidate = (value: ValueType) => {
  const decimal = getMiniDecimal(value);
  return decimal.isInvalidate() ? null : decimal;
};

// >>> Max & Min limit
const maxDecimal = computed(() => getDecimalIfValidate(max));
const minDecimal = computed(() => getDecimalIfValidate(min));

const upDisabled = computed(() => {
  if (!maxDecimal.value || !decimalValue.value || decimalValue.value.isInvalidate()) {
    return false;
  }

  return maxDecimal.value.lessEquals(decimalValue.value);
});

const downDisabled = computed(() => {
  if (!minDecimal.value || !decimalValue.value || decimalValue.value.isInvalidate()) {
    return false;
  }

  return decimalValue.value.lessEquals(minDecimal.value);
});

// Cursor controller
const [recordCursor, restoreCursor] = useCursor(inputRef, focus);

// ============================= Data =============================
/**
 * Find target value closet within range.
 * e.g. [11, 28]:
 *    3  => 11
 *    23 => 23
 *    99 => 28
 */
function getRangeValue(target: DecimalClass) {
  // target > max
  if (maxDecimal.value && !target.lessEquals(maxDecimal.value)) {
    return maxDecimal.value;
  }

  // target < min
  if (minDecimal.value && !minDecimal.value.lessEquals(target)) {
    return minDecimal.value;
  }

  return null;
}

/**
 * Check value is in [min, max] range
 */
const isInRange = (target: DecimalClass) => !getRangeValue(target);
const getDecimalValue = (stringMode: boolean, decimalValue: DecimalClass) => {
  if (stringMode || decimalValue.isEmpty()) {
    return decimalValue.toString();
  }

  return decimalValue.toNumber();
};

/**
 * Trigger `onChange` if value validated and not equals of origin.
 * Return the value that re-align in range.
 */
function triggerValueUpdate(newValue: DecimalClass, userTyping: boolean): DecimalClass {
  let updateValue = newValue;
  let isRangeValidate = isInRange(updateValue) || updateValue.isEmpty();

  // Skip align value when trigger value is empty.
  // We just trigger onChange(null)
  // This should not block user typing
  if (!updateValue.isEmpty() && !userTyping) {
    // Revert value in range if needed
    updateValue = getRangeValue(updateValue) || updateValue;
    isRangeValidate = true;
  }
  if (!readonly && !disabled && isRangeValidate) {
    const numStr = updateValue.toString();
    const mergedPrecision = getPrecision(numStr, userTyping);
    if (mergedPrecision >= 0) {
      updateValue = getMiniDecimal(toFixed(numStr, '.', mergedPrecision));

      // When to fixed. The value may out of min & max range.
      // 4 in [0, 3.8] => 3.8 => 4 (toFixed)
      if (!isInRange(updateValue)) {
        updateValue = getMiniDecimal(toFixed(numStr, '.', mergedPrecision, true));
      }
    }
    // Trigger event
    if (!updateValue.equals(decimalValue.value)) {
      setUncontrolledDecimalValue(updateValue);
      const val = updateValue.isEmpty() ? null : getDecimalValue(stringMode, updateValue);
      inputValue.value = val;
      inputValueRef.value = val;
      value.value = val;
      onChange?.(val);
      // Reformat input if value is not controlled
      if (value.value === undefined) {
        setInputValue(updateValue, userTyping);
      }
    }

    return updateValue;
  }

  return decimalValue.value;
}

// ========================== User Input ==========================
const onNextPromise = useFrame();

// >>> Collect input value
const collectInputValue = (inputStr: string) => {
  recordCursor();

  // Update inputValueRef in case input can not parse as number
  // Refresh ref value immediately since it may used by formatter
  inputValueRef.value = inputStr;
  inputValue.value = inputStr;

  // Parse number
  if (!compositionRef.value) {
    const finalValue = mergedParser(inputStr);
    const finalDecimal = getMiniDecimal(finalValue);
    if (!finalDecimal.isNaN()) {
      triggerValueUpdate(finalDecimal, true);
    }
  }

  // Trigger onInput later to let user customize value if they want to handle something after onChange
  onInput?.(inputStr);

  // optimize for chinese input experience
  // https://github.com/ant-design/ant-design/issues/8196
  onNextPromise(() => {
    let nextInputStr = inputStr;
    if (!parser) {
      nextInputStr = inputStr.replace(/。/g, '.');
    }

    if (nextInputStr !== inputStr) {
      collectInputValue(nextInputStr);
    }
  });
};

// >>> Composition
const onCompositionstart = () => {
  compositionRef.value = true;
};

const onCompositionend = () => {
  compositionRef.value = false;

  collectInputValue(inputRef.value.value);
};

// >>> Input
const onInternalInput = (e) => {
  collectInputValue(e.target.value);
};

// ============================= Step =============================
const onInternalStep = (up: boolean, emitter: 'handler' | 'keyboard' | 'wheel') => {
  // Ignore step since out of range
  if ((up && upDisabled.value) || (!up && downDisabled.value)) {
    return;
  }

  // Clear typing status since it may be caused by up & down key.
  // We should sync with input value.
  userTypingRef.value = false;

  let stepDecimal = getMiniDecimal(shiftKeyRef.value ? getDecupleSteps(step) : step);
  if (!up) {
    stepDecimal = stepDecimal.negate();
  }

  const target = (decimalValue.value || getMiniDecimal(0)).add(stepDecimal.toString());
  const updatedValue = triggerValueUpdate(target, false);
  onStep?.(getDecimalValue(stringMode, updatedValue), {
    offset: shiftKeyRef.value ? getDecupleSteps(step) : step,
    type: up ? 'up' : 'down',
    emitter,
  });

  inputRef.value?.focus();
};

// ============================ Flush =============================
/**
 * Flush value input content to trigger value change & re-formatter input if needed.
 * This will always flush input value for update.
 * If it's invalidate, will fallback to last validate value.
 */
const flushInputValue = (userTyping: boolean) => {
  const parsedValue = getMiniDecimal(mergedParser(inputValueRef.value));
  let formatValue: DecimalClass;
  if (!parsedValue.isNaN()) {
    // Only validate value or empty value can be re-fill to inputValueRef
    // Reassign the formatValue within ranged of trigger control
    formatValue = triggerValueUpdate(parsedValue, userTyping);
  } else {
    formatValue = triggerValueUpdate(decimalValue.value, userTyping);
  }

  if (value.value !== undefined) {
    // Reset back with controlled value first

    setInputValue(decimalValue.value, false);
  } else if (!formatValue.isNaN()) {
    // Reset input back since no validate value
    setInputValue(formatValue, false);
  }
};

// Solve the issue of the event triggering sequence when entering numbers in chinese input (Safari)
const onBeforeinput = () => {
  userTypingRef.value = true;
};

const onKeydown = (event) => {
  const { key, shiftKey } = event;
  userTypingRef.value = true;

  shiftKeyRef.value = shiftKey;

  if (key === 'Enter') {
    if (!compositionRef.value) {
      userTypingRef.value = false;
    }
    flushInputValue(false);
    onPressEnter?.(event);
  }

  if (keyboard === false) {
    return;
  }

  // Do step
  if (!compositionRef.value && ['Up', 'ArrowUp', 'Down', 'ArrowDown'].includes(key)) {
    onInternalStep(key === 'Up' || key === 'ArrowUp', 'keyboard');
    event.preventDefault();
  }
};

const onKeyup = () => {
  userTypingRef.value = false;
  shiftKeyRef.value = false;
};

const onWheel = (event) => {
  // moving mouse wheel rises wheel event with deltaY < 0
  // scroll value grows from top to bottom, as screen Y coordinate
  onInternalStep(event.deltaY < 0, 'wheel');
  event.preventDefault();
};

watch(
  [() => changeOnWheel, () => focus],
  () => {
    if (changeOnWheel && focus) {
      const input = inputRef.value;
      if (input) {
        input.addEventListener('wheel', onWheel, { passive: false });
      }
    }
  },
  { deep: true, immediate: true },
);

onBeforeUnmount(() => {
  const input = inputRef.value;
  if (input) {
    input.removeEventListener('wheel', onWheel);
  }
});

// >>> Focus & Blur
const onBlur = () => {
  if (changeOnBlur) {
    flushInputValue(false);
  }
  focus.value = false;
  userTypingRef.value = false;
};

// >>> Mouse events
const onInternalMouseDown = (event) => {
  if (inputRef.value && event.target !== inputRef.value) {
    inputRef.value.focus();
    event.preventDefault();
  }

  onMousedown?.(event);
};

// ========================== Controlled ==========================
// Input by precision & formatter
watch(
  () => precision,
  () => {
    if (!decimalValue.value.isInvalidate()) {
      setInputValue(decimalValue.value, false);
    }
  },
  { flush: 'post' },
);

watch(
  value,
  (val) => {
    const newValue = getMiniDecimal(val);
    decimalValue.value = newValue;
    const currentParsedValue = getMiniDecimal(mergedParser(inputValueRef.value));
    // When user typing from `1.2` to `1.`, we should not convert to `1` immediately.
    // But let it go if user set `formatter`
    if (!newValue.equals(currentParsedValue) || !userTypingRef.value || formatter) {
      // Update value as effect
      setInputValue(newValue, userTypingRef.value);
    }
  },
  { flush: 'post' },
);

// ============================ Cursor ============================
watch(
  inputValue,
  () => {
    if (formatter) {
      restoreCursor();
    }
  },
  { flush: 'post' },
);

// ============================ Render ============================
// >>>>>> Handler
const sharedHandlerProps = computed(() => ({
  prefixCls,
  onStep: onInternalStep,
  class: classNames?.action,
  style: styles?.action,
}));
</script>

<template>
  <div
    ref="rootRef"
    :class="
      clsx(prefixCls, `${prefixCls}-mode-${mode}`, className, classNames?.root, {
        [`${prefixCls}-focused`]: focus,
        [`${prefixCls}-disabled`]: disabled,
        [`${prefixCls}-readonly`]: readonly,
        [`${prefixCls}-not-a-number`]: decimalValue.isNaN(),
        [`${prefixCls}-out-of-range`]: !decimalValue.isInvalidate() && !isInRange(decimalValue),
      })
    "
    :style="{ ...styles?.root, ...style }"
    @mousedown="onInternalMouseDown"
    @mouseup="onMouseup"
    @mouseleave="onMouseleave"
    @mousemove="onMousemove"
    @mouseenter="onMouseenter"
    @mouseout="onMouseout"
    @click="onClick"
    @keydown="onKeydown"
    @keyup="onKeyup"
    @compositionstart="onCompositionstart"
    @compositionend="onCompositionend"
    @beforeinput="onBeforeinput"
  >
    <StepHandler v-if="mode === 'spinner' && controls" v-bind="sharedHandlerProps" action="down" :disabled="downDisabled">
      <Render :content="downHandler" />
    </StepHandler>
    <div v-if="prefix !== undefined" :class="clsx(`${prefixCls}-prefix`, classNames?.prefix)" :style="styles?.prefix">
      <Render :content="prefix" />
    </div>
    <input
      autocomplete="off"
      role="spinbutton"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="decimalValue.isInvalidate() ? null : decimalValue.toString()"
      :step="step"
      v-bind="{ ...restProps, ...$attrs }"
      :value="inputValue"
      ref="inputRef"
      :class="clsx(`${prefixCls}-input`, classNames?.input)"
      :style="styles?.input"
      :disabled="disabled"
      :readonly="readonly"
      @input="onInternalInput"
      @blur="onBlur"
      @focus="focus = true"
    />
    <div v-if="suffix !== undefined" :class="clsx(`${prefixCls}-suffix`, classNames?.suffix)" :style="styles?.suffix">
      <Render :content="suffix" />
    </div>
    <StepHandler v-if="mode === 'spinner' && controls" v-bind="sharedHandlerProps" action="up" :disabled="upDisabled">
      <Render :content="upHandler" />
    </StepHandler>
    <div v-if="mode === 'input' && controls" :class="clsx(`${prefixCls}-actions`, classNames?.actions)" :style="styles?.actions">
      <StepHandler v-bind="sharedHandlerProps" action="up" :disabled="upDisabled">
        <Render :content="upHandler" />
      </StepHandler>
      <StepHandler v-bind="sharedHandlerProps" action="down" :disabled="downDisabled">
        <Render :content="downHandler" />
      </StepHandler>
    </div>
  </div>
</template>
