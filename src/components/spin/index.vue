<script lang="tsx" setup>
import { computed, effect, ref, toRefs, useSlots, watch, type CSSProperties } from 'vue';
import { useComponentConfig } from '../config-provider/context';
import Indicator from './Indicator/index.vue';
import useStyle from './style/index';
import usePercent from './usePercent';
import type { VueNode } from '@/vc-util/type';
import { debounce } from 'throttle-debounce';
import clsx from 'clsx';
import Render from '@/vc-component/render';

export type SpinIndicator = VueNode;
type SemanticName = 'root' | 'wrapper' | 'mask' | 'indicator';
export interface SpinProps {
  /** Customize prefix class name */
  prefixCls?: string;
  /** Additional class name of Spin */
  class?: string;
  /** Additional root class name of Spin */
  rootClassName?: string;
  /** Whether Spin is spinning */
  spinning?: boolean;
  /** Style of Spin */
  style?: CSSProperties;
  /** Size of Spin, options: `small`, `default` and `large` */
  size?: SpinSize;
  /** Customize description content when Spin has children */
  tip?: VueNode;
  /** Specifies a delay in milliseconds for loading state (prevent flush) */
  delay?: number;
  /** The className of wrapper when Spin has children */
  wrapperClassName?: string;
  /** React node of the spinning indicator */
  indicator?: SpinIndicator;
  /** Display a backdrop with the `Spin` component */
  fullscreen?: boolean;
  percent?: number | 'auto';
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
}

export type SpinType = SpinProps & {
  setDefaultIndicator: (indicator: VueNode) => void;
};

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  spinning: customSpinning = true,
  delay = 0,
  class: className,
  rootClassName,
  size = 'default',
  tip,
  wrapperClassName,
  style,
  fullscreen = false,
  indicator,
  percent,
  classNames: spinClassNames,
  styles,
  ...restProps
} = defineProps<SpinProps>();

const _SpinSizes = ['small', 'default', 'large'] as const;
export type SpinSize = (typeof _SpinSizes)[number];

function shouldDelay(spinning?: boolean, delay?: number): boolean {
  return !!spinning && !!delay && !Number.isNaN(Number(delay));
}

const {
  getPrefixCls,
  direction,
  indicator: contextIndicator,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('spin'));

const prefixCls = computed(() => getPrefixCls.value('spin', customizePrefixCls));

const [hashId, cssVarCls] = useStyle(prefixCls);

const spinning = ref<boolean>(customSpinning && !shouldDelay(customSpinning, delay));

const mergedPercent = usePercent(
  spinning,
  computed(() => percent),
);

effect(() => {
  console.log(mergedPercent.value, spinning.value, percent);
});

watch([() => delay, () => customSpinning], (_, _1, clear) => {
  if (customSpinning) {
    const showSpinning = debounce(delay, () => {
      spinning.value = true;
    });
    showSpinning();

    clear(() => {
      showSpinning?.cancel?.();
    });
  }

  spinning.value = false;
});

const slots = useSlots();

const isNestedPattern = computed<boolean>(() => slots.default && !fullscreen);

const spinClassName = computed(() => {
  return clsx(
    prefixCls.value,
    contextClassName?.value,
    {
      [`${prefixCls.value}-sm`]: size === 'small',
      [`${prefixCls.value}-lg`]: size === 'large',
      [`${prefixCls.value}-spinning`]: spinning.value,
      [`${prefixCls.value}-show-text`]: !!tip,
      [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
    },
    className,
    !fullscreen && rootClassName,
    !fullscreen && spinClassNames?.root,
    !fullscreen && contextClassNames.value.root,
    hashId.value,
    cssVarCls.value,
  );
});

const containerClassName = computed(() => {
  return clsx(`${prefixCls.value}-container`, {
    [`${prefixCls.value}-blur`]: spinning?.value,
  });
});

const mergedIndicator = computed(() => indicator ?? contextIndicator);

const rootStyle = computed<CSSProperties>(() => ({ ...contextStyles.value.root, ...styles?.root }));
const wrapStyle = computed<CSSProperties>(() => ({ ...contextStyles.value.wrapper, ...styles?.wrapper }));
const mergedStyle = computed<CSSProperties>(() => ({ ...contextStyle?.value, ...style }));

const SpinElement = () => (
  <div
    {...restProps}
    style={fullscreen ? mergedStyle.value : { ...rootStyle.value, ...mergedStyle.value }}
    class={spinClassName.value}
    aria-live="polite"
    aria-busy={spinning.value}
  >
    <Indicator
      class={clsx(spinClassNames?.indicator, contextClassNames?.value?.indicator)}
      style={{ ...contextStyles?.value?.indicator, ...styles?.indicator }}
      prefixCls={prefixCls.value}
      indicator={mergedIndicator.value}
      percent={mergedPercent.value}
    />
    {(slots?.tip || tip) && (isNestedPattern.value || fullscreen) ? (
      <div class={`${prefixCls.value}-text`}>
        <Render content={slots?.tip || tip}></Render>
      </div>
    ) : null}
  </div>
);
</script>
<template>
  <div
    v-if="isNestedPattern"
    v-bind="restProps"
    :class="clsx(`${prefixCls}-nested-loading`, wrapperClassName, hashId, cssVarCls)"
    :style="wrapStyle"
  >
    <div v-if="spinning" key="loading">
      <SpinElement />
    </div>
    <div :class="containerClassName" key="container">
      <slot></slot>
    </div>
  </div>
  <div v-else-if="fullscreen">
    <div
      :class="
        clsx(
          `${prefixCls}-fullscreen`,
          {
            [`${prefixCls}-fullscreen-show`]: spinning,
          },
          rootClassName,
          hashId,
          cssVarCls,
          spinClassNames?.mask,
          contextClassNames.mask,
        )
      "
      :style="{ ...contextStyles.mask, ...styles?.mask }"
    >
      <SpinElement />
    </div>
  </div>
  <SpinElement v-else />
</template>
