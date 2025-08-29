<script lang="tsx" setup>
import CSSMotion from '@/vc-component/motion';
import { computed, ref, toRefs, watch } from 'vue';
import { MenuContextProvider, useMenuContextInject } from '../context/MenuContext';
import type { MenuMode } from '../interface';
import { getMotion } from '../utils/motionUtil';
import SubMenuList from './SubMenuList.vue';

export interface InlineSubMenuListProps {
  id?: string;
  open: boolean;
  keyPath: string[];
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { id, open, keyPath } = defineProps<InlineSubMenuListProps>();

const fixedMode: MenuMode = 'inline';

const { prefixCls, forceSubMenuRender, motion, defaultMotions, mode } = toRefs(useMenuContextInject());

// Always use latest mode check
const sameModeRef = ref(false);
sameModeRef.value = mode?.value === fixedMode;

// We record `destroy` mark here since when mode change from `inline` to others.
// The inline list should remove when motion end.
const destroy = ref(!sameModeRef.value);

const mergedOpen = computed(() => (sameModeRef.value ? open : false));

// ================================= Effect =================================
// Reset destroy state when mode change back
watch(
  mode,
  () => {
    if (sameModeRef.value) {
      destroy.value = false;
    }
  },
  { immediate: true },
);

// ================================= Render =================================
const mergedMotion = computed(() => {
  const result = { ...getMotion(fixedMode, motion?.value, defaultMotions?.value) };

  // No need appear since nest inlineCollapse changed
  if (keyPath.length > 1) {
    result.motionAppear = false;
  }

  // Hide inline list when mode changed and motion end
  const originOnVisibleChanged = result.onVisibleChanged;
  result.onVisibleChanged = (newVisible) => {
    if (!sameModeRef.value && !newVisible) {
      destroy.value = true;
    }

    return originOnVisibleChanged?.(newVisible);
  };
  return result;
});
</script>
<template>
  <template v-if="destroy"></template>
  <template v-else>
    <MenuContextProvider :value="{ mode: fixedMode, locked: !sameModeRef }">
      <CSSMotion
        :visible="mergedOpen"
        v-bind="mergedMotion"
        :force-render="forceSubMenuRender"
        :remove-on-leave="false"
        :leaved-class-name="`${prefixCls}-hidden`"
      >
        <template #default="{ class: motionClassName, style: motionStyle, ref: motionRef }">
          <SubMenuList :id="id" :class="motionClassName" :style="motionStyle" :ref="motionRef">
            <slot></slot>
          </SubMenuList>
        </template>
      </CSSMotion>
    </MenuContextProvider>
  </template>
</template>
