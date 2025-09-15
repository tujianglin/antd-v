<script lang="tsx" setup>
import { Render } from '@/components';
import type { VueNode } from '@/vc-util/type';
import { computed, onBeforeUnmount, watch, type CSSProperties } from 'vue';
import { PathTrackerContextProvider, useFullPath, usePathRegisterContextInject } from '../context/PathContext';
import type { PopupRender, SubMenuType } from '../interface';
import { parseChildren } from '../utils/commonUtil';
import InternalSubMenu from './InternalSubMenu.vue';

export type SemanticName = 'list' | 'listTitle';

export interface SubMenuProps extends Omit<SubMenuType, 'key' | 'label'> {
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  title?: VueNode;

  /** @private Used for rest popup. Do not use in your prod */
  internalPopupClose?: boolean;

  /** @private Internal filled key. Do not set it directly */
  eventKey?: string;

  /** @private Do not use. Private warning empty usage */
  warnKey?: boolean;
  popupRender?: PopupRender;
  // >>>>>>>>>>>>>>>>>>>>> Next  Round <<<<<<<<<<<<<<<<<<<<<<<
  // onDestroy?: DestroyEventHandler;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { eventKey } = defineProps<SubMenuProps>();

const connectedKeyPath = useFullPath(computed(() => eventKey));

// ==================== Record KeyPath ====================
const measure = usePathRegisterContextInject();

watch(
  connectedKeyPath,
  () => {
    if (measure) {
      measure.registerPath(eventKey, connectedKeyPath.value);
    }
  },
  { immediate: true, deep: true },
);

onBeforeUnmount(() => {
  measure?.unregisterPath(eventKey, connectedKeyPath.value);
});
</script>
<template>
  <PathTrackerContextProvider :value="connectedKeyPath">
    <template v-if="measure">
      <Render :content="parseChildren($slots?.default?.(), connectedKeyPath)" />
    </template>
    <template v-else>
      <InternalSubMenu v-bind="$props">
        <Render :content="parseChildren($slots?.default?.(), connectedKeyPath)" />
      </InternalSubMenu>
    </template>
  </PathTrackerContextProvider>
</template>
