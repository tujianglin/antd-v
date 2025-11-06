<script lang="tsx" setup generic="RecordType extends KeyWiseTransferItem">
import { computed } from 'vue';
import type { KeyWiseTransferItem, SemanticName } from './index.vue';
import Checkbox from '../checkbox';
import { useLocale } from '../locale';
import defaultLocale from '../locale/en_US';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import Render from '@/vc-component/render';
import { DeleteOutlined } from '@ant-design/icons-vue';
import type { SemanticClassNames, SemanticStyles } from '../_util/hooks';

type ListItemProps<RecordType> = {
  prefixCls: string;
  classNames: SemanticClassNames<SemanticName>;
  styles: SemanticStyles<SemanticName>;

  renderedText?: string | number;
  renderedEl: VueNode;
  disabled?: boolean;
  checked?: boolean;
  onClick: (item: RecordType, e: MouseEvent) => void;
  onRemove?: (item: RecordType) => void;
  item: RecordType;
  showRemove?: boolean;
};

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, classNames, styles, renderedText, renderedEl, item, checked, disabled, onClick, onRemove, showRemove } =
  defineProps<ListItemProps<RecordType>>();

const classes = computed(() =>
  clsx(`${prefixCls}-content-item`, classNames.item, {
    [`${prefixCls}-content-item-disabled`]: disabled || item.disabled,
    [`${prefixCls}-content-item-checked`]: checked && !item.disabled,
  }),
);

const title = computed(() => {
  let result: string | undefined;
  if (typeof renderedText === 'string' || typeof renderedText === 'number') {
    result = String(renderedText);
  }
  return result;
});

const [contextLocale] = useLocale('Transfer', defaultLocale.Transfer);

const liProps = computed(() => ({
  className: classes.value,
  style: styles.item,
  title: title.value,
}));

const LabelNode = () => (
  <span class={clsx(`${prefixCls}-content-item-text`, classNames.itemContent)} style={styles.itemContent}>
    <Render content={renderedEl}></Render>
  </span>
);
</script>
<template>
  <li v-if="showRemove" v-bind="liProps">
    <LabelNode />
    <button
      type="button"
      :disabled="disabled || item.disabled"
      :class="`${prefixCls}-content-item-remove`"
      :aria-label="contextLocale?.remove"
      @click="() => onRemove?.(item)"
    >
      <DeleteOutlined />
    </button>
  </li>
  <li v-else v-bind="liProps" @click="(event) => (disabled || item.disabled ? undefined : onClick(item, event))">
    <Checkbox
      :class="clsx(`${prefixCls}-checkbox`, classNames.itemIcon)"
      :style="styles.itemIcon"
      :checked="checked"
      :disabled="disabled || item.disabled"
    />
    <LabelNode />
  </li>
</template>
