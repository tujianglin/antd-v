<script lang="tsx" setup>
import { computed, onMounted, ref, toRefs, watch, type CSSProperties, type VNode } from 'vue';

import clsx from 'clsx';
import { isValidElement } from '../_util/isValidNode';
import { responsiveArray, type Breakpoint } from '../_util/responsiveObserver';
import { devUseWarning } from '../_util/warning';
import { useComponentConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useSize from '../config-provider/hooks/useSize';
import useBreakpoint from '../grid/hooks/useBreakpoint';
import { useAvatarContextInject, type AvatarSize } from './AvatarContext';
import useStyle from './style';
import ResizeObserver from '@/vc-component/resize-observer';
import Render from '../render';

export interface AvatarProps {
  /** Shape of avatar, options: `circle`, `square` */
  shape?: 'circle' | 'square';
  /*
   * Size of avatar, options: `large`, `small`, `default`
   * or a custom number size
   * */
  size?: AvatarSize;
  gap?: number;
  /** Src of image avatar */
  src?: any;
  /** Srcset of image avatar */
  srcset?: string;
  draggable?: boolean | 'true' | 'false';
  /** Icon to be used in avatar */
  icon?: any;
  style?: CSSProperties;
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
  alt?: string;
  crossorigin?: '' | 'anonymous' | 'use-credentials';
  onClick?: (e?: MouseEvent) => void;
  /* callback when img load error */
  /* return false to prevent Avatar show default fallback behavior, then you can do fallback by yourself */
  onError?: () => boolean;
}

defineOptions({ name: 'Avatar', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  shape,
  size: customSize,
  src,
  srcset,
  icon,
  class: className,
  rootClassName,
  style,
  alt,
  draggable,
  crossorigin,
  gap = 4,
  onError,
  ...others
} = defineProps<AvatarProps>();

const slots = defineSlots<{ default: () => VNode[]; icon: () => VNode[]; src: () => VNode[] }>();

const iconNode = computed(() => slots.icon || icon);
const srcNode = computed(() => slots.src || src);

const scale = ref(1);
const mounted = ref(false);
const isImgExist = ref(true);

const avatarNodeRef = ref<HTMLSpanElement>(null);
const avatarChildrenRef = ref<HTMLSpanElement>(null);

const { getPrefixCls, class: contextClassName, style: contextStyle } = toRefs(useComponentConfig('avatar'));

const avatarCtx = useAvatarContextInject();

const setScaleParam = () => {
  if (!avatarChildrenRef.value || !avatarNodeRef.value) {
    return;
  }
  const childrenWidth = avatarChildrenRef.value.offsetWidth; // offsetWidth avoid affecting be transform scale
  const nodeWidth = avatarNodeRef.value.offsetWidth;
  // denominator is 0 is no meaning
  if (childrenWidth !== 0 && nodeWidth !== 0) {
    if (gap * 2 < nodeWidth) {
      scale.value = nodeWidth - gap * 2 < childrenWidth ? (nodeWidth - gap * 2) / childrenWidth : 1;
    }
  }
};

onMounted(() => {
  mounted.value = true;
});

watch(
  srcNode,
  () => {
    isImgExist.value = true;
    scale.value = 1;
  },
  { immediate: true, deep: true },
);

watch(
  () => gap,
  () => {
    setScaleParam();
  },
  { immediate: true },
);

const handleImgLoadError = () => {
  const errorFlag = onError?.();
  if (errorFlag !== false) {
    isImgExist.value = false;
  }
};

const size = useSize(computed(() => (ctxSize) => customSize ?? avatarCtx?.size ?? ctxSize ?? 'default'));

const needResponsive = computed(() =>
  Object.keys(typeof size.value === 'object' ? size.value || {} : {}).some((key) =>
    ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'].includes(key),
  ),
);
const screens = useBreakpoint(needResponsive.value);
const responsiveSizeStyle = computed<CSSProperties>(() => {
  if (typeof size.value !== 'object') {
    return {};
  }

  const currentBreakpoint: Breakpoint = responsiveArray.find((screen) => screens.value[screen])!;

  const currentSize = size.value[currentBreakpoint];

  return currentSize
    ? {
        width: `${currentSize}px`,
        height: `${currentSize}px`,
        fontSize: `${currentSize && (iconNode.value || slots.default) ? currentSize / 2 : 18}px`,
      }
    : {};
});

if (process.env.NODE_ENV !== 'production') {
  const warning = devUseWarning('Avatar');

  warning(
    !(typeof iconNode.value === 'string' && iconNode.value.length > 2),
    'breaking',
    `\`icon\` is using ReactNode instead of string naming in v4. Please check \`${iconNode.value}\` at https://ant.design/components/icon`,
  );
}

const prefixCls = computed(() => getPrefixCls.value('avatar', customizePrefixCls));
const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

const sizeCls = computed(() =>
  clsx({
    [`${prefixCls.value}-lg`]: size.value === 'large',
    [`${prefixCls.value}-sm`]: size.value === 'small',
  }),
);

const hasImageElement = computed(() => isValidElement(srcNode.value));

const mergedShape = computed(() => shape || avatarCtx?.shape || 'circle');

const classString = computed(() =>
  clsx(
    prefixCls.value,
    sizeCls.value,
    contextClassName?.value,
    `${prefixCls.value}-${mergedShape.value}`,
    {
      [`${prefixCls.value}-image`]: hasImageElement.value || (srcNode.value && isImgExist.value),
      [`${prefixCls.value}-icon`]: !!iconNode.value,
    },
    cssVarCls.value,
    rootCls.value,
    className,
    rootClassName,
    hashId.value,
  ),
);

const sizeStyle = computed<CSSProperties>(() =>
  typeof size.value === 'number'
    ? {
        width: `${size.value}px`,
        height: `${size.value}px`,
        fontSize: `${iconNode.value ? size.value / 2 : 18}px`,
      }
    : {},
);

const ChildrenToRender = () => {
  let childrenToRender;
  if (typeof srcNode.value === 'string' && isImgExist.value) {
    childrenToRender = (
      <img
        src={srcNode.value}
        draggable={draggable}
        srcset={srcset}
        onError={handleImgLoadError}
        alt={alt}
        crossorigin={crossorigin}
      />
    );
  } else if (hasImageElement.value) {
    childrenToRender = <Render content={srcNode.value}></Render>;
  } else if (iconNode.value) {
    childrenToRender = <Render content={iconNode.value}></Render>;
  } else if (mounted.value || scale.value !== 1) {
    const transformString = `scale(${scale.value})`;
    const childrenStyle: CSSProperties = {
      msTransform: transformString,
      WebkitTransform: transformString,
      transform: transformString,
    };

    childrenToRender = (
      <ResizeObserver onResize={setScaleParam}>
        <span class={`${prefixCls.value}-string`} ref={avatarChildrenRef} style={{ ...childrenStyle }}>
          {slots.default?.()}
        </span>
      </ResizeObserver>
    );
  } else {
    childrenToRender = (
      <span class={`${prefixCls.value}-string`} style={{ opacity: 0 }} ref={avatarChildrenRef}>
        {slots.default?.()}
      </span>
    );
  }
  return childrenToRender;
};
</script>
<template>
  <span
    v-bind="others"
    :style="{ ...sizeStyle, ...responsiveSizeStyle, ...contextStyle, ...style }"
    :class="classString"
    ref="avatarNodeRef"
  >
    <ChildrenToRender />
  </span>
</template>
