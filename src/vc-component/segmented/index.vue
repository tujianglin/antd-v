<script lang="tsx" setup>
import { computed, getCurrentInstance, onMounted, ref, type CSSProperties, type HTMLAttributes } from 'vue';
import InternalSegmentedOption from './InternalSegmentedOption.vue';
import clsx from 'clsx';
import MotionThumb from './MotionThumb.vue';
import { Render } from '@/components';
import findDOMNode from '@/vc-util/Dom/findDOMNode';

export type SemanticName = 'item' | 'label';
export type SegmentedValue = string | number;

export type SegmentedRawOption = SegmentedValue;

export interface SegmentedLabeledOption<ValueType = SegmentedRawOption> {
  className?: string;
  disabled?: boolean;
  label: any;
  value: ValueType;
  /**
   * html `title` property for label
   */
  title?: string;
}

export type ItemRender = (node: any, info: { item: SegmentedLabeledOption }) => any;

type SegmentedOptions<T = SegmentedRawOption> = (T | SegmentedLabeledOption<T>)[];

export interface SegmentedProps<ValueType = SegmentedValue>
  extends /** @vue-ignore */ Omit<HTMLAttributes, 'style' | 'class' | 'onChange'> {
  class?: string;
  style?: CSSProperties;
  options?: SegmentedOptions<ValueType>;
  onChange?: (value: any) => void;
  disabled?: boolean;
  prefixCls?: string;
  direction?: 'ltr' | 'rtl';
  motionName?: string;
  vertical?: boolean;
  name?: string;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  itemRender?: ItemRender;
}

const {
  prefixCls = 'rc-segmented',
  direction,
  vertical,
  options = [],
  disabled,
  name,
  onChange,
  class: className = '',
  style,
  styles,
  classNames: segmentedClassNames,
  motionName = 'thumb-motion',
  itemRender,
  ...restProps
} = defineProps<SegmentedProps>();

function getValidTitle(option: SegmentedLabeledOption) {
  if (typeof option.title !== 'undefined') {
    return option.title;
  }

  // read `label` when title is `undefined`
  if (typeof option.label !== 'object') {
    return option.label?.toString();
  }
}

function normalizeOptions(options: SegmentedOptions): SegmentedLabeledOption[] {
  return options.map((option) => {
    if (typeof option === 'object' && option !== null) {
      const validTitle = getValidTitle(option);
      return {
        ...option,
        title: validTitle,
      };
    }
    return {
      label: option?.toString(),
      title: option?.toString(),
      value: option as any,
    };
  });
}

const containerRef = ref<HTMLDivElement>(null);

const segmentedOptions = computed(() => {
  return normalizeOptions(options) || [];
});

// Note: We should not auto switch value when value not exist in options
// which may break single source of truth.
const rawValue = defineModel<string | number>('value', {});

rawValue.value = rawValue.value || segmentedOptions.value[0]?.value;

// ======================= Change ========================
const thumbShow = ref(false);

const handleChange = (_, val: SegmentedRawOption) => {
  rawValue.value = val;
  onChange?.(val);
};

// ======================= Focus ========================
const isKeyboard = ref(false);
const isFocused = ref(false);

const handleFocus = () => {
  isFocused.value = true;
};

const handleBlur = () => {
  isFocused.value = false;
};

const handleMouseDown = () => {
  isKeyboard.value = false;
};

// capture keyboard tab interaction for correct focus style
const handleKeyUp = (event: KeyboardEvent) => {
  if (event.key === 'Tab') {
    isKeyboard.value = true;
  }
};

// ======================= Keyboard ========================
const onOffset = (offset: number) => {
  const currentIndex = segmentedOptions.value.findIndex((option) => option.value === rawValue.value);

  const total = segmentedOptions.value.length;
  const nextIndex = (currentIndex + offset + total) % total;

  const nextOption = segmentedOptions.value[nextIndex];
  if (nextOption) {
    rawValue.value = nextOption.value;
    onChange?.(nextOption.value);
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowLeft':
    case 'ArrowUp':
      onOffset(-1);
      break;
    case 'ArrowRight':
    case 'ArrowDown':
      onOffset(1);
      break;
  }
};

const renderOption = (segmentedOption: SegmentedLabeledOption) => {
  const { value: optionValue, disabled: optionDisabled } = segmentedOption;

  return (
    <InternalSegmentedOption
      {...segmentedOption}
      name={name}
      data={segmentedOption}
      itemRender={itemRender}
      key={optionValue}
      prefixCls={prefixCls}
      class={clsx(segmentedOption.className, `${prefixCls}-item`, segmentedClassNames?.item, {
        [`${prefixCls}-item-selected`]: optionValue === rawValue.value && !thumbShow.value,
        [`${prefixCls}-item-focused`]: isFocused.value && isKeyboard.value && optionValue === rawValue.value,
      })}
      style={styles?.item}
      classNames={segmentedClassNames}
      styles={styles}
      checked={optionValue === rawValue.value}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeydown={handleKeyDown}
      onKeyup={handleKeyUp}
      onMousedown={handleMouseDown}
      disabled={!!disabled || !!optionDisabled}
    />
  );
};

const vm = getCurrentInstance();

onMounted(() => {
  containerRef.value = findDOMNode(vm);
});
</script>
<template>
  <div
    role="radiogroup"
    aria-label="segmented control"
    :tabindex="disabled ? undefined : 0"
    :style="style"
    v-bind="restProps"
    :class="
      clsx(
        prefixCls,
        {
          [`${prefixCls}-rtl`]: direction === 'rtl',
          [`${prefixCls}-disabled`]: disabled,
          [`${prefixCls}-vertical`]: vertical,
        },
        className,
      )
    "
  >
    <div :class="`${prefixCls}-group`">
      <MotionThumb
        :vertical="vertical"
        :prefix-cls="prefixCls"
        :value="rawValue"
        :container-ref="containerRef"
        :motion-name="`${prefixCls}-${motionName}`"
        :direction="direction"
        :get-value-index="(val) => segmentedOptions.findIndex((n) => n.value === val)"
        @motion-start="
          () => {
            thumbShow = true;
          }
        "
        @motion-end="
          () => {
            thumbShow = false;
          }
        "
      />
      <template v-for="item in segmentedOptions" :key="item.value">
        <Render :content="renderOption(item)" />
      </template>
    </div>
  </div>
</template>
