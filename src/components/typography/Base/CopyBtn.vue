<script lang="tsx" setup>
import { CheckOutlined, CopyOutlined, LoadingOutlined } from '@ant-design/icons-vue';
import { reactiveComputed } from '@vueuse/core';
import clsx from 'clsx';
import { computed, h, toRefs } from 'vue';
import type { Locale } from '../../locale';
import Tooltip from '../../tooltip';
import type { CopyConfig } from './index.vue';
import { getNode, toList } from './util';

export interface CopyBtnProps extends Omit<CopyConfig, 'onCopy'> {
  prefixCls: string;
  copied: boolean;
  locale: Locale['Text'];
  onCopy: (e: MouseEvent) => void;
  iconOnly: boolean;
  loading: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  copied,
  locale,
  iconOnly,
  tooltips = undefined,
  icon,
  tabindex,
  onCopy,
  loading: btnLoading,
} = defineProps<CopyBtnProps>();

const tooltipNodes = computed(() => toList(tooltips));
const iconNodes = computed(() => toList(icon));
const { copied: copiedText, copy: copyText } = toRefs(reactiveComputed(() => locale ?? {}));
const systemStr = computed(() => (copied ? copiedText.value : copyText.value));
const copyTitle = computed<any>(() => getNode(tooltipNodes.value[copied ? 1 : 0], systemStr.value));
const ariaLabel = computed(() => (typeof copyTitle.value === 'string' ? copyTitle.value : systemStr.value));
</script>
<template>
  <Tooltip :title="copyTitle">
    <button
      type="button"
      :class="
        clsx(`${prefixCls}-copy`, {
          [`${prefixCls}-copy-success`]: copied,
          [`${prefixCls}-copy-icon-only`]: iconOnly,
        })
      "
      @click="onCopy"
      :aria-label="ariaLabel"
      :tabindex="tabindex"
    >
      <component v-if="copied" :is="getNode(iconNodes[1], h(CheckOutlined), true)" />
      <component v-else :is="getNode(iconNodes[0], btnLoading ? h(LoadingOutlined) : h(CopyOutlined), true)" />
    </button>
  </Tooltip>
</template>
