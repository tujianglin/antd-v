<script lang="tsx" setup>
import { Render } from '@/components';
import { useTemplateRef, type CSSProperties } from 'vue';
import type { EditableConfig, TabsLocale } from '../interface';

export interface AddButtonProps {
  prefixCls: string;
  editable?: EditableConfig;
  locale?: TabsLocale;
  style?: CSSProperties;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, editable, locale, style } = defineProps<AddButtonProps>();

const domRef = useTemplateRef('domRef');

defineExpose({
  get el() {
    return domRef.value;
  },
});
</script>
<template>
  <template v-if="!editable || editable.showAdd === false"></template>
  <button
    v-else
    ref="domRef"
    type="button"
    :class="`${prefixCls}-nav-add`"
    :style="style"
    :aria-label="locale?.addAriaLabel || 'Add tab'"
    @click="
      (event) => {
        editable.onEdit('add', { event });
      }
    "
  >
    <Render :content="editable?.addIcon || '+'" />
  </button>
</template>
