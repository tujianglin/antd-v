<script lang="tsx" setup>
import { ref } from 'vue';
import type { TabBarExtraContent, TabBarExtraMap, TabBarExtraPosition } from '../interface';
import Render from '@/vc-component/render';
import type { VueNode } from '@/vc-util/type';
import { isValidElement } from '@/vc-util/Children/util';

interface ExtraContentProps {
  position: TabBarExtraPosition;
  prefixCls: string;
  extra?: TabBarExtraContent;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { position, prefixCls, extra } = defineProps<ExtraContentProps>();

const Content = () => {
  let content;
  // Parse extra
  let assertExtra: TabBarExtraMap = {};
  if (typeof extra === 'object' && !isValidElement(extra)) {
    assertExtra = extra as TabBarExtraMap;
  } else {
    assertExtra.right = <Render content={extra as VueNode}></Render>;
  }

  if (position === 'right') {
    content = assertExtra?.right;
  }

  if (position === 'left') {
    content = assertExtra?.left;
  }
  return content;
};
const domRef = ref();

defineExpose({
  get el() {
    return domRef.value;
  },
});
</script>
<template>
  <div v-if="Content()" :class="`${prefixCls}-extra-content`" ref="domRef">
    <Content />
  </div>
</template>
