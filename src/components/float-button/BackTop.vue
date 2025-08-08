<script lang="tsx" setup>
import { computed, onBeforeUnmount, onMounted, ref, type ButtonHTMLAttributes, type CSSProperties } from 'vue';
import getScroll from '../_util/getScroll';
import scrollTo from '../_util/scrollTo';
import { useConfigContextInject } from '../config-provider';
import { useGroupContextInject } from './context';
import { floatButtonPrefixCls, type FloatButtonProps } from './interface';
import { VerticalAlignTopOutlined } from '@ant-design/icons-vue';
import FloatButton from './FloatButton.vue';
import clsx from 'clsx';
import { throttle } from 'lodash-es';
export interface BackTopProps extends Omit<FloatButtonProps, 'target'> {
  visibilityHeight?: number;
  onClick?: ButtonHTMLAttributes['onClick'];
  target?: () => HTMLElement | Window | Document;
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
  style?: CSSProperties;
  duration?: number;
}

defineOptions({ name: 'BackTop', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  type = 'default',
  shape = 'circle',
  visibilityHeight = 400,
  icon = <VerticalAlignTopOutlined />,
  target,
  onClick,
  duration = 450,
  ...restProps
} = defineProps<BackTopProps>();

const visible = ref<boolean>(visibilityHeight === 0);

const internalRef = ref<HTMLButtonElement>(null);

const getDefaultTarget = computed((): HTMLElement | Document | Window => {
  return internalRef.value?.ownerDocument || window;
});

const handleScroll = (e: Event | { target: any }) => {
  const scrollTop = getScroll(e.target);
  visible.value = scrollTop >= visibilityHeight;
};

const throttleByAnimationFrame = throttle(handleScroll);

let container: HTMLElement | Document | Window;

onMounted(() => {
  container = target?.() || getDefaultTarget.value;
  throttleByAnimationFrame({ target: container });
  container.addEventListener('scroll', throttleByAnimationFrame);
});

onBeforeUnmount(() => {
  throttleByAnimationFrame.cancel();
  container.removeEventListener('scroll', throttleByAnimationFrame);
});

const scrollToTop = (e) => {
  scrollTo(0, { getContainer: (target as any) || (() => getDefaultTarget.value), duration });
  onClick?.(e);
};

const config = useConfigContextInject();

const prefixCls = config.getPrefixCls(floatButtonPrefixCls, customizePrefixCls);
const rootPrefixCls = config.getPrefixCls();

const groupContext = useGroupContextInject();

const mergedShape = computed(() => groupContext.shape || shape);

const contentProps = computed((): FloatButtonProps => {
  return {
    prefixCls,
    icon,
    type,
    shape: mergedShape.value,
    ...restProps,
  };
});
</script>
<template>
  <Transition :name="`${rootPrefixCls}-fade`">
    <div v-show="visible">
      <FloatButton ref="internalRef" v-bind="contentProps" @click="scrollToTop" :class="clsx(className)" />
    </div>
  </Transition>
</template>
