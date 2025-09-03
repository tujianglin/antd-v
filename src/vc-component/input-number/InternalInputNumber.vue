<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue';
import type { DecimalClass, ValueType } from '../mini-decimal';
import getMiniDecimal, { getNumberPrecision, num2str, toFixed, validateNumber } from '../mini-decimal';
import useCursor from './hooks/useCursor';
import useFrame from './hooks/useFrame';
import type { InternalInputNumberProps } from './interface';
import StepHandler from './StepHandler.vue';
import { getDecupleSteps } from './utils/numberUtil';

defineOptions({ inheritAttrs: false });
const {
  prefixCls,
  class: className,
  style,
  min,
  max,
  step = 1,
  disabled,
  readonly,
  upHandler,
  downHandler,
  keyboard,
  changeOnWheel,
  controls = true,
  stringMode,
  parser,
  formatter,
  precision,
  decimalSeparator,
  onChange,
  onInput,
  onPressEnter,
  onStep,
  changeOnBlur,
  ...inputProps
} = defineProps<InternalInputNumberProps>();
const value = defineModel<ValueType>('value');

const inputClassName = `${prefixCls}-input`;

const inputRef = shallowRef<HTMLInputElement>(null);
const domRef = shallowRef<HTMLDivElement>(null);

const focus = shallowRef(false);
const userTypingRef = shallowRef(false);
const compositionRef = shallowRef(false);
const shiftKeyRef = shallowRef(false);
const decimalValue = shallowRef(getMiniDecimal(value.value));

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
const inputValueRef = shallowRef<string | number>('');
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
const inputValue = shallowRef<string | number>('');

watch(
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
      onChange?.(updateValue.isEmpty() ? null : getDecimalValue(stringMode, updateValue));

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
const onCompositionStart = () => {
  compositionRef.value = true;
};

const onCompositionEnd = () => {
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
const onBeforeInput = () => {
  userTypingRef.value = true;
};

const onKeyDown = (event) => {
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

const onKeyUp = () => {
  userTypingRef.value = false;
  shiftKeyRef.value = false;
};

// >>> Focus & Blur
const onBlur = () => {
  if (changeOnBlur) {
    flushInputValue(false);
  }
  focus.value = false;
  userTypingRef.value = false;
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
  () => value.value,
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
  () => inputValue.value,
  () => {
    if (formatter) {
      restoreCursor();
    }
  },
  { flush: 'post' },
);

const onWheel = (event) => {
  // moving mouse wheel rises wheel event with deltaY < 0
  // scroll value grows from top to bottom, as screen Y coordinate
  onInternalStep(event.deltaY < 0, 'wheel');
  event.preventDefault();
};

watch(
  [() => changeOnWheel, () => focus],
  ([val1, val2]) => {
    if (val1 && val2) {
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

defineExpose({
  get domRef() {
    return domRef.value as HTMLDivElement;
  },
  get input() {
    return inputRef.value as HTMLInputElement;
  },
});
</script>

<template>
  <div
    ref="domRef"
    :class="
      clsx(prefixCls, className, {
        [`${prefixCls}-focused`]: focus,
        [`${prefixCls}-disabled`]: disabled,
        [`${prefixCls}-readonly`]: readonly,
        [`${prefixCls}-not-a-number`]: decimalValue.isNaN(),
        [`${prefixCls}-out-of-range`]: !decimalValue.isInvalidate() && !isInRange(decimalValue),
      })
    "
    :style="style"
    @keydown="onKeyDown"
    @keyup="onKeyUp"
    @compositionstart="onCompositionStart"
    @compositionend="onCompositionEnd"
    @beforeinput="onBeforeInput"
  >
    <StepHandler
      v-if="controls"
      :prefix-cls="prefixCls"
      :up-node="upHandler"
      :down-node="downHandler"
      :up-disabled="upDisabled"
      :down-disabled="downDisabled"
      @step="onInternalStep"
    />
    <div :class="`${inputClassName}-wrap`">
      <input
        autocomplete="off"
        role="spinbutton"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuenow="decimalValue.isInvalidate() ? null : decimalValue.toString()"
        :step="step"
        v-bind="{ ...inputProps, ...$attrs }"
        :value="inputValue"
        ref="inputRef"
        :class="inputClassName"
        :disabled="disabled"
        :readonly="readonly"
        @change="onInternalInput"
        @blur="onBlur"
        @focus="focus = true"
      />
    </div>
  </div>
</template>
