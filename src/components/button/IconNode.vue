<script lang="tsx" setup>
import { type CSSProperties } from 'vue';
import Render from '../render';
import type { ButtonProps } from './buttonHelpers';
import DefaultLoadingIcon from './DefaultLoadingIcon.vue';
import IconWrapper from './IconWrapper.vue';
type Props = {
  prefixCls?: string;
  icon?: ButtonProps['icon'];
  loading?: ButtonProps['loading'];
  innerLoading?: boolean;
  iconSharedProps?: {
    class?: string;
    style?: CSSProperties;
  };
};
defineProps<Props>();
</script>
<template>
  <IconWrapper v-if="icon && !innerLoading" :prefix-cls="prefixCls" v-bind="iconSharedProps">
    <Render :content="icon" />
  </IconWrapper>
  <IconWrapper
    v-else-if="loading && typeof loading === 'object' && loading.icon"
    :prefix-cls="prefixCls"
    v-bind="iconSharedProps"
  >
    <Render :content="loading.icon" />
  </IconWrapper>
  <DefaultLoadingIcon v-else :exist-icon="!!icon" :prefix-cls="prefixCls" :loading="innerLoading" v-bind="iconSharedProps" />
</template>
