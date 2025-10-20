<script lang="tsx" setup>
import Render from '@/vc-component/render';
import type { VueNode } from '@/vc-util/type';
import { toRefs } from 'vue';
import Button from '../../button';
import { convertLegacyProps } from '../../button/buttonHelpers';
import { useModalContextInject } from '../context';
import type { ModalProps } from '../interface';

export interface NormalOkBtnProps extends Pick<ModalProps, 'confirmLoading' | 'okType' | 'okButtonProps' | 'onOk'> {
  okTextLocale?: VueNode;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { confirmLoading, okButtonProps, okType, okTextLocale, onOk } = toRefs(useModalContextInject());
</script>
<template>
  <Button v-bind="{ ...convertLegacyProps(okType), ...okButtonProps }" :loading="confirmLoading" @click="onOk">
    <Render :content="okTextLocale" />
  </Button>
</template>
