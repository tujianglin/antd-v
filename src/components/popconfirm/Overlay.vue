<script lang="tsx" setup>
import type { PopconfirmProps } from './index.vue';
import { getRenderPropValue } from '../_util/getRenderPropValue';
import Button from '../button';
import { useLocale } from '../locale';
import defaultLocale from '../locale/en_US';
import { ExclamationCircleFilled } from '@ant-design/icons-vue';
import { toRefs } from 'vue';
import { useConfigContextInject } from '../config-provider';
import { convertLegacyProps } from '../button/buttonHelpers';
import ActionButton from '../_util/ActionButton.vue';
import Render from '@/vc-component/render';
import type { SemanticClassNames, SemanticStyles } from '../_util/hooks';
import type { PopoverSemanticName } from '../popover/index.vue';
import clsx from 'clsx';

export interface PopconfirmLocale {
  okText: string;
  cancelText: string;
}

export interface OverlayProps
  extends Pick<
    PopconfirmProps,
    | 'icon'
    | 'okButtonProps'
    | 'cancelButtonProps'
    | 'cancelText'
    | 'okText'
    | 'okType'
    | 'showCancel'
    | 'title'
    | 'description'
    | 'onPopupClick'
  > {
  prefixCls: string;
  close?: (...args: any[]) => void;
  onConfirm?: (e: MouseEvent) => void;
  onCancel?: (e: MouseEvent) => void;
  classNames?: SemanticClassNames<PopoverSemanticName>;
  styles?: SemanticStyles<PopoverSemanticName>;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  okButtonProps,
  cancelButtonProps,
  title,
  description,
  cancelText,
  okText,
  okType = 'primary',
  icon = <ExclamationCircleFilled />,
  showCancel = true,
  close,
  onConfirm,
  onCancel,
  onPopupClick,
  classNames,
  styles,
} = defineProps<OverlayProps>();

const { getPrefixCls } = toRefs(useConfigContextInject());

const [contextLocale] = useLocale('Popconfirm', defaultLocale.Popconfirm);

const titleNode = getRenderPropValue(title);
const descriptionNode = getRenderPropValue(description);
</script>
<template>
  <div :class="`${prefixCls}-inner-content`" @click="onPopupClick">
    <div :class="`${prefixCls}-message`">
      <span v-if="icon" :class="`${prefixCls}-message-icon`">
        <Render :content="icon" />
      </span>
      <div :class="`${prefixCls}-message-text`">
        <div v-if="titleNode" :class="clsx(`${prefixCls}-title`, classNames?.title)" :style="styles?.title">
          <Render :content="titleNode" />
        </div>
        <div v-if="descriptionNode" :class="clsx(`${prefixCls}-description`, classNames?.content)" :style="styles?.content">
          <Render :content="descriptionNode" />
        </div>
      </div>
    </div>
    <div :class="`${prefixCls}-buttons`">
      <Button v-if="showCancel" @click="onCancel" size="small" v-bind="cancelButtonProps">
        <Render :content="cancelText || contextLocale?.cancelText" />
      </Button>
      <ActionButton
        :button-props="{
          size: 'small',
          ...convertLegacyProps(okType),
          ...okButtonProps,
        }"
        :action-fn="onConfirm"
        :close="close"
        :prefix-cls="getPrefixCls('btn')"
        quit-on-nullish-return-value
        emit-event
      >
        <Render :content="okText || contextLocale?.okText" />
      </ActionButton>
    </div>
  </div>
</template>
