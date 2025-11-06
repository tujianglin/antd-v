<script lang="tsx" setup>
import Render from '@/vc-component/render';
import type { VueNode } from '@/vc-util/type';
import { CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled, InfoCircleFilled } from '@ant-design/icons-vue';
import clsx from 'clsx';
import type { SemanticClassNames, SemanticClassNamesType, SemanticStyles, SemanticStylesType } from '../_util/hooks';
import type { IconType, NotificationSemantic } from './interface';
import type { PurePanelProps } from './PurePanel.vue';

export type PurePanelClassNamesType = SemanticClassNamesType<PurePanelProps, NotificationSemantic>;

export type PurePanelStylesType = SemanticStylesType<PurePanelProps, NotificationSemantic>;

export interface PureContentProps {
  prefixCls: string;
  icon?: VueNode;
  title?: VueNode;
  description?: VueNode;
  actions?: VueNode;
  type?: IconType;
  role?: 'alert' | 'status';
  classNames: SemanticClassNames<NotificationSemantic>;
  styles: SemanticStyles<NotificationSemantic>;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  icon,
  type,
  title,
  description,
  actions,
  role = 'alert',
  styles,
  classNames: pureContentCls,
} = defineProps<PureContentProps>();

const typeToIcon = {
  success: CheckCircleFilled,
  info: InfoCircleFilled,
  error: CloseCircleFilled,
  warning: ExclamationCircleFilled,
};
</script>
<template>
  <div :class="clsx({ [`${prefixCls}-with-icon`]: icon || type })" :role="role">
    <span v-if="icon" :class="clsx(`${prefixCls}-icon`, pureContentCls.icon)" :style="styles.icon">
      <Render :content="icon" />
    </span>
    <component
      v-else-if="type"
      :is="typeToIcon[type] || null"
      :class="clsx(`${prefixCls}-icon`, pureContentCls.icon, `${prefixCls}-icon-${type}`)"
      :style="styles.icon"
    />
    <div :class="clsx(`${prefixCls}-title`, pureContentCls.title)" :style="styles.title">
      <Render :content="title" />
    </div>
    <div v-if="description" :class="clsx(`${prefixCls}-description`, pureContentCls.description)" :style="styles.description">
      <Render :content="description" />
    </div>
    <div v-if="actions" :class="clsx(`${prefixCls}-actions`, pureContentCls.actions)" :style="styles.actions">
      <Render :content="actions" />
    </div>
  </div>
</template>
