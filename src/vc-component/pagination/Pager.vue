<script lang="tsx" setup>
import { computed, type CSSProperties } from 'vue';
import type { PaginationProps } from './interface';
import clsx from 'clsx';
import { Render } from '@/components';

export interface PagerProps extends Pick<PaginationProps, 'itemRender'> {
  rootPrefixCls: string;
  page: number;
  active?: boolean;
  class?: string;
  style?: CSSProperties;
  showTitle: boolean;
  onClick?: (page: number) => void;
  onKeypress?: (e: KeyboardEvent, onClick: PagerProps['onClick'], page: PagerProps['page']) => void;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  rootPrefixCls,
  page,
  active,
  class: className,
  style,
  showTitle,
  onClick,
  onKeypress,
  itemRender,
} = defineProps<PagerProps>();

const prefixCls = computed(() => `${rootPrefixCls}-item`);

const cls = computed(() => {
  return clsx(
    prefixCls.value,
    `${prefixCls.value}-${page}`,
    {
      [`${prefixCls.value}-active`]: active,
      [`${prefixCls.value}-disabled`]: !page,
    },
    className,
  );
});

const handleClick = () => {
  onClick(page);
};

const handleKeyPress = (e: KeyboardEvent) => {
  onKeypress(e, onClick, page);
};

const pager = () => {
  return itemRender(page, 'page', <a rel="nofollow">{page}</a>);
};
</script>
<template>
  <div v-if="pager()">
    <li
      :title="showTitle ? String(page) : null"
      :class="cls"
      :style="style"
      @click="handleClick"
      @keydown="handleKeyPress"
      :tabindex="0"
    >
      <Render :content="pager" />
    </li>
  </div>
</template>
