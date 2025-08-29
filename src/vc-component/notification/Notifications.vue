<script lang="tsx" setup>
import type { CSSMotionProps } from '@/vc-component/motion';
import { computed, ref, watch, type CSSProperties } from 'vue';
import type { InnerOpenConfig, OpenConfig, Placement, Placements, StackConfig } from './interface';
import NoticeList from './NoticeList.vue';
import { Render } from '@/components';

export interface NotificationsProps {
  prefixCls?: string;
  motion?: CSSMotionProps | ((placement: Placement) => CSSMotionProps);
  container?: HTMLElement | ShadowRoot;
  maxCount?: number;
  class?: (placement: Placement) => string;
  style?: (placement: Placement) => CSSProperties;
  onAllRemoved?: VoidFunction;
  stack?: StackConfig;
  renderNotifications?: (node: any, info: { prefixCls: string; key: PropertyKey }) => any;
}

export interface NotificationsRef {
  open: (config: OpenConfig) => void;
  close: (key: PropertyKey) => void;
  destroy: () => void;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls = 'rc-notification',
  container,
  motion,
  maxCount,
  class: className,
  style,
  onAllRemoved,
  stack,
  renderNotifications,
} = defineProps<NotificationsProps>();

const configList = ref<any[]>([]);

// ======================== Close =========================
const onNoticeClose = (key: PropertyKey) => {
  // Trigger close event
  const config = configList.value.find((item) => item.key === key);
  const closable = config?.closable;
  const closableObj = closable && typeof closable === 'object' ? closable : {};
  const { onClose: closableOnClose } = closableObj;
  closableOnClose?.();
  config?.onClose?.();
  configList.value = configList.value.filter((item) => item.key !== key);
};

// ========================= Refs =========================
defineExpose({
  open: (config) => {
    let clone = [...configList.value];

    // Replace if exist
    const index = clone.findIndex((item) => item.key === config.key);
    const innerConfig: InnerOpenConfig = { ...config };
    if (index >= 0) {
      innerConfig.times = ((configList.value[index] as InnerOpenConfig)?.times || 0) + 1;
      clone[index] = innerConfig;
    } else {
      innerConfig.times = 0;
      clone.push(innerConfig);
    }

    if (maxCount > 0 && clone.length > maxCount) {
      clone = clone.slice(-maxCount);
    }
    configList.value = clone;
  },
  close: (key) => {
    onNoticeClose(key);
  },
  destroy: () => {
    configList.value = [];
  },
});

// ====================== Placements ======================
const placements = ref({});

watch(
  configList,
  () => {
    const nextPlacements: Placements = {};

    configList.value.forEach((config) => {
      const { placement = 'topRight' } = config;

      if (placement) {
        nextPlacements[placement] = nextPlacements[placement] || [];
        nextPlacements[placement].push(config);
      }
    });

    // Fill exist placements to avoid empty list causing remove without motion
    Object.keys(placements.value).forEach((placement) => {
      nextPlacements[placement] = nextPlacements[placement] || [];
    });

    placements.value = nextPlacements;
  },
  { immediate: true, deep: true },
);

// Clean up container if all notices fade out
const onAllNoticeRemoved = (placement: Placement) => {
  const clone = {
    ...placements.value,
  };
  const list = clone[placement] || [];

  if (!list.length) {
    delete clone[placement];
  }

  placements.value = clone;
};

// Effect tell that placements is empty now
const emptyRef = ref(false);
watch(
  placements,
  () => {
    if (Object.keys(placements.value).length > 0) {
      emptyRef.value = true;
    } else if (emptyRef.value) {
      // Trigger only when from exist to empty
      onAllRemoved?.();
      emptyRef.value = false;
    }
  },
  { immediate: true, deep: true },
);
// ======================== Render ========================
const placementList = computed(() => Object.keys(placements.value) as Placement[]);

const ItemNode = () => {
  return placementList.value.map((placement) => {
    const placementConfigList = placements.value[placement];
    const list = (
      <NoticeList
        key={placement}
        configList={placementConfigList}
        placement={placement}
        prefixCls={prefixCls}
        class={className?.(placement)}
        style={style?.(placement)}
        motion={motion}
        onNoticeClose={onNoticeClose}
        onAllNoticeRemoved={onAllNoticeRemoved}
        stack={stack}
      />
    );
    return <Render content={renderNotifications ? renderNotifications(list, { prefixCls, key: placement }) : list}></Render>;
  });
};
</script>
<template>
  <template v-if="container">
    <Teleport :to="container">
      <ItemNode />
    </Teleport>
  </template>
</template>
