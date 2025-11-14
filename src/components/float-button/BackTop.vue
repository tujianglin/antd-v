<script lang="tsx" setup>
import { computed, onBeforeUnmount, onMounted, ref, toRefs, type ButtonHTMLAttributes, type CSSProperties } from 'vue';
import getScroll from '../_util/getScroll';
import scrollTo from '../_util/scrollTo';
import { useConfigContextInject } from '../config-provider';
import { useGroupContextInject } from './context';
import { floatButtonPrefixCls, type FloatButtonProps } from './interface';
import { VerticalAlignTopOutlined } from '@ant-design/icons-vue';
import FloatButton from './FloatButton.vue';
import clsx from 'clsx';
import { throttle } from 'es-toolkit/compat';
import CSSMotion from '@/vc-component/motion';
import { composeRef } from '@/vc-util/ref';
import { useComponentConfig } from '../config-provider/context';
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
  icon,
  target,
  onClick,
  duration = 450,
  ...restProps
} = defineProps<BackTopProps>();

const defaultIcon = <VerticalAlignTopOutlined />;

const { backTopIcon: contextIcon } = toRefs(useComponentConfig('floatButton'));

const mergedIcon = computed(() => icon ?? contextIcon?.value ?? defaultIcon);

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

const { getPrefixCls } = toRefs(useConfigContextInject());

const prefixCls = computed(() => getPrefixCls.value(floatButtonPrefixCls, customizePrefixCls));
const rootPrefixCls = computed(() => getPrefixCls.value());

const groupContext = useGroupContextInject();

const mergedShape = computed(() => groupContext.shape || shape);

const contentProps = computed((): FloatButtonProps => {
  return {
    prefixCls: prefixCls.value,
    icon: mergedIcon.value,
    type,
    shape: mergedShape.value,
    ...restProps,
  };
});
</script>
<template>
  <CSSMotion :visible="visible" :motion-name="`${rootPrefixCls}-fade`">
    <template #default="{ class: montionClassName, ref: motionRef }">
      <FloatButton
        :ref="composeRef((e) => (internalRef = e), motionRef)"
        v-bind="contentProps"
        @click="scrollToTop"
        :class="clsx(className, montionClassName)"
      />
    </template>
  </CSSMotion>
</template>
