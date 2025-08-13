<script lang="tsx" setup>
import { omit } from 'lodash-es';
import { reactive, watch, type HTMLAttributes, type VNode } from 'vue';
import type { CSSMotionProps } from './CSSMotion.vue';
import OriginCSSMotion from './CSSMotion.vue';
import { diffKeys, parseKeys, STATUS_ADD, STATUS_KEEP, STATUS_REMOVE, STATUS_REMOVED, type KeyObject } from './util/diff';

export interface CSSMotionListProps extends Omit<CSSMotionProps, 'onVisibleChanged'>, /** @vue-ignore */ HTMLAttributes {
  keys: (PropertyKey | { key: PropertyKey; [name: string]: any })[];
  component?: any;

  /** This will always trigger after final visible changed. Even if no motion configured. */
  onVisibleChanged?: (visible: boolean, info: { key: PropertyKey }) => void;
  /** All motion leaves in the screen */
  onAllRemoved?: () => void;
}

export interface CSSMotionListState {
  keyEntities: KeyObject[];
}

const props = withDefaults(defineProps<CSSMotionListProps>(), { component: 'div' });

defineSlots<{ default: (props?: any) => VNode }>();

const state = reactive({
  keyEntities: [] as KeyObject[],
});

// ZombieJ: Return the count of rest keys. It's safe to refactor if need more info.
// 更新 keyEntities（等价于 getDerivedStateFromProps）
watch(
  () => props.keys,
  (newKeys) => {
    const parsedKeyObjects = parseKeys(newKeys);
    const mixedKeyEntities = diffKeys(state.keyEntities, parsedKeyObjects);

    state.keyEntities = mixedKeyEntities.filter((entity) => {
      const prevEntity = state.keyEntities.find(({ key }) => entity.key === key);
      if (prevEntity && prevEntity.status === STATUS_REMOVED && entity.status === STATUS_REMOVE) {
        return false;
      }
      return true;
    });
  },
  { immediate: true },
);
// 删除 key
function removeKey(removeKey: string | number) {
  state.keyEntities = state.keyEntities.map((entity) => {
    if (entity.key !== removeKey) return entity;
    return { ...entity, status: STATUS_REMOVED };
  });

  const restKeysCount = state.keyEntities.filter(({ status }) => status !== STATUS_REMOVED).length;

  if (restKeysCount === 0 && props.onAllRemoved) {
    props.onAllRemoved();
  }
}
</script>
<template>
  <component :is="props.component || 'div'">
    <OriginCSSMotion
      v-for="({ status, ...eventProps }, index) in state.keyEntities"
      :key="eventProps.key"
      v-bind="{
        ...omit(props, ['onVisibleChanged']),
        ...$attrs,
        visible: status === STATUS_ADD || status === STATUS_KEEP,
        eventProps,
      }"
      @visible-changed="
        (changedVisible) => {
          props.onVisibleChanged?.(changedVisible, { key: eventProps.key });
          if (!changedVisible) {
            removeKey(eventProps.key);
          }
        }
      "
    >
      <template #default="{ ...motionProps }">
        <slot v-bind="{ ...motionProps, index }"></slot>
      </template>
    </OriginCSSMotion>
  </component>
</template>
