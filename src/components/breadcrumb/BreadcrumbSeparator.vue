<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, toRefs } from 'vue';
import { useConfigContextInject } from '../config-provider';
import { useBreadcrumbContextInject } from './BreadcrumbContext';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 }, __ANT_BREADCRUMB_SEPARATOR: true });

const { getPrefixCls } = toRefs(useConfigContextInject());
const prefixCls = computed(() => getPrefixCls.value('breadcrumb'));
const breadcrumbContext = useBreadcrumbContextInject();
const { classNames: mergedClassNames, styles: mergedStyles } = toRefs(breadcrumbContext);
</script>
<template>
  <li :class="clsx(`${prefixCls}-separator`, mergedClassNames?.separator)" :style="mergedStyles?.separator" aria-hidden="true">
    <slot> / </slot>
  </li>
</template>
