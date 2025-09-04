<script lang="tsx" setup>
import { CSSMotionList, type CSSMotionProps } from '@/vc-component/motion';
import type { VueKey } from '@/vc-util/type';
import clsx from 'clsx';
import { omit } from 'lodash-es';
import { computed, ref, toRefs, watch, type CSSProperties } from 'vue';
import useStack from './hooks/useStack';
import type { InnerOpenConfig, OpenConfig, Placement, StackConfig } from './interface';
import Notice from './Notice.vue';
import { useNotificationContextInject } from './NotificationProvider';

export interface NoticeListProps {
  configList?: OpenConfig[];
  placement?: Placement;
  prefixCls?: string;
  motion?: CSSMotionProps | ((placement: Placement) => CSSMotionProps);
  stack?: StackConfig;

  // Events
  onAllNoticeRemoved?: (placement: Placement) => void;
  onNoticeClose?: (key: VueKey) => void;

  // Common
  class?: string;
  style?: CSSProperties;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  configList,
  placement,
  prefixCls,
  class: className,
  style,
  motion,
  onAllNoticeRemoved,
  onNoticeClose,
  stack: stackConfig,
} = defineProps<NoticeListProps>();

const { classNames: ctxCls } = toRefs(useNotificationContextInject());

const dictRef = ref({});
const latestNotice = ref<HTMLDivElement>(null);
const hoverKeys = ref<string[]>([]);

const keys = computed(() => {
  return configList.map((config) => ({
    config,
    key: String(config.key),
  }));
});

const [stack, resConfig] = useStack(stackConfig);

const expanded = computed(() => stack.value && (hoverKeys.value.length > 0 || keys.value.length <= resConfig.value?.threshold));

const placementMotion = computed(() => (typeof motion === 'function' ? motion(placement) : motion));

// Clean hover key
watch(
  [hoverKeys, keys, stack],
  () => {
    if (stack.value && hoverKeys.value.length > 1) {
      hoverKeys.value = hoverKeys.value.filter((key) => keys.value.some(({ key: dataKey }) => key === dataKey));
    }
  },
  { immediate: true, deep: true },
);

// Force update latest notice
watch(
  [keys, stack],
  () => {
    if (stack.value && dictRef.value[keys.value[keys.value.length - 1]?.key]) {
      latestNotice.value = dictRef.value[keys.value[keys.value.length - 1]?.key];
    }
  },
  { immediate: true, deep: true },
);

const noticeRootStyle = (config, motionIndex) => {
  const { key } = config as InnerOpenConfig;
  const strKey = String(key);
  const dataIndex = keys.value.findIndex((item) => item.key === strKey);

  const stackStyle: CSSProperties = {};
  if (stack.value) {
    const index = keys.value.length - 1 - (dataIndex > -1 ? dataIndex : motionIndex - 1);
    const transformX = placement === 'top' || placement === 'bottom' ? '-50%' : '0';
    if (index > 0) {
      stackStyle.height = expanded.value ? dictRef.value[strKey]?.offsetHeight : latestNotice.value?.offsetHeight;
      // Transform
      let verticalOffset = 0;
      for (let i = 0; i < index; i++) {
        verticalOffset += dictRef.value[keys.value[keys.value.length - 1 - i].key]?.offsetHeight + resConfig.value.gap;
      }

      const transformY =
        (expanded.value ? verticalOffset : index * resConfig.value.offset) * (placement.startsWith('top') ? 1 : -1);
      const scaleX =
        !expanded.value && latestNotice.value?.offsetWidth && dictRef.value[strKey]?.offsetWidth
          ? (latestNotice.value?.offsetWidth - resConfig.value.offset * 2 * (index < 3 ? index : 3)) /
            dictRef.value[strKey]?.offsetWidth
          : 1;

      stackStyle.transform = `translate3d(${transformX}, ${transformY}px, 0) scaleX(${scaleX})`;
    } else {
      stackStyle.transform = `translate3d(${transformX}, 0, 0)`;
    }
  }
  return {
    ...stackStyle,
    ...config.styles?.wrapper,
  };
};
</script>
<template>
  <CSSMotionList
    :key="placement"
    :class="
      clsx(prefixCls, `${prefixCls}-${placement}`, ctxCls?.list, className, {
        [`${prefixCls}-stack`]: !!stack,
        [`${prefixCls}-stack-expanded`]: expanded,
      })
    "
    :style="style"
    :keys="keys"
    motion-appear
    v-bind="placementMotion"
    @all-removed="
      () => {
        onAllNoticeRemoved(placement);
      }
    "
  >
    <template #default="{ config, index: motionIndex, class: motionClassName, style: motionStyle, ref: motionRef }">
      <div
        :ref="motionRef"
        :class="clsx(`${prefixCls}-notice-wrapper`, motionClassName, config.class)"
        :style="{
          ...motionStyle,
          ...noticeRootStyle(config, motionIndex),
        }"
        @mouseenter="
          () => {
            hoverKeys = hoverKeys.includes(config.key) ? hoverKeys : [...hoverKeys, config.key];
          }
        "
        @mouseleave="
          () => {
            hoverKeys = hoverKeys.filter((k) => k !== config.key);
          }
        "
      >
        <Notice
          v-bind="omit(config, ['class', 'style', 'classNames', 'styles'])"
          :ref="
            (node) => {
              const dataIndex = keys.findIndex((item) => item.key === config.key);
              if (dataIndex > -1) {
                dictRef[config.key] = node;
              } else {
                delete dictRef[config.key];
              }
            }
          "
          :prefix-cls="prefixCls"
          :class-names="config.classNames"
          :styles="config.styles"
          :class="clsx(config.class, ctxCls?.notice)"
          :style="config.style"
          :times="config.times"
          :key="config.key"
          :event-key="config.key"
          @notice-close="onNoticeClose"
          :hovering="stack && hoverKeys.length > 0"
        />
      </div>
    </template>
  </CSSMotionList>
</template>
