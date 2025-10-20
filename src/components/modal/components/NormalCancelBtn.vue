<script lang="tsx" setup>
import Render from '@/vc-component/render';
import type { VueNode } from '@/vc-util/type';
import { toRefs } from 'vue';
import Button from '../../button';
import { useModalContextInject } from '../context';
import type { ModalProps } from '../interface';

export interface NormalCancelBtnProps extends Pick<ModalProps, 'cancelButtonProps' | 'onCancel'> {
  cancelTextLocale?: VueNode;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { cancelButtonProps, cancelTextLocale, onCancel } = toRefs(useModalContextInject());
</script>
<template>
  <Button @click="onCancel" v-bind="cancelButtonProps">
    <Render :content="cancelTextLocale" />
  </Button>
</template>
