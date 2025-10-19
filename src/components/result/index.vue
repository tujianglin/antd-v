<script lang="tsx" setup>
import { CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled, WarningFilled } from '@ant-design/icons-vue';
import useMergeSemantic from '../_util/hooks/useMergeSemantic';
import { useComponentConfig } from '../config-provider/context';
import noFound from './noFound.vue';
import serverError from './serverError.vue';
import useStyle from './style';
import unauthorized from './unauthorized.vue';
import type { VueNode } from '@/vc-util/type';
import { computed, defineComponent, toRefs, type Component, type CSSProperties, type VNode } from 'vue';
import Render from '@/vc-component/render';
import clsx from 'clsx';

export type ExceptionStatusType = 403 | 404 | 500 | '403' | '404' | '500';
export type ResultStatusType = ExceptionStatusType | keyof typeof IconMap;
type SemanticName = 'root' | 'title' | 'subTitle' | 'body' | 'extra' | 'icon';

export interface ResultProps {
  icon?: VueNode;
  status?: ResultStatusType;
  title?: VueNode;
  subTitle?: VueNode;
  extra?: VueNode;
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
  style?: CSSProperties;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
}

export interface ResultType extends ResultProps {
  PRESENTED_IMAGE_404: Component;
  PRESENTED_IMAGE_403: Component;
  PRESENTED_IMAGE_500: Component;
}

defineOptions({ name: 'Result', inheritAttrs: false, compatConfig: { MODE: 3 } });
const {
  prefixCls: customizePrefixCls,
  class: customizeClassName,
  rootClassName,
  subTitle,
  title,
  style,
  status = 'info',
  icon,
  extra,
  styles,
  classNames: resultClassNames,
} = defineProps<ResultProps>();

const slots = defineSlots<{
  default?: () => VNode[];
  subTitle?: () => VNode[];
  title?: () => VNode[];
  icon?: () => VNode[];
  extra?: () => VNode[];
}>();

const subTitleSlot = computed(() => slots.subTitle?.() || subTitle);
const titleSlot = computed(() => slots.title?.() || title);
const iconSlot = computed(() => slots.icon?.() || icon);
const extraSlot = computed(() => slots.extra?.() || extra);

const IconMap = {
  success: CheckCircleFilled,
  error: CloseCircleFilled,
  info: ExclamationCircleFilled,
  warning: WarningFilled,
};

const ExceptionMap = {
  '404': noFound,
  '500': serverError,
  '403': unauthorized,
};

// ExceptionImageMap keys
const ExceptionStatus = Object.keys(ExceptionMap);

// eslint-disable-next-line vue/one-component-per-file
const Icon = defineComponent({
  props: ['icon', 'status', 'class', 'style'],
  setup(props) {
    const { icon, status, class: className, style } = toRefs(props);
    return () => {
      if (ExceptionStatus.includes(`${status.value}`)) {
        const SVGComponent = ExceptionMap[status.value as ExceptionStatusType];
        return (
          <div class={className.value} style={style.value}>
            <SVGComponent />
          </div>
        );
      }

      if (icon.value === null || icon.value === false) {
        return null;
      }

      return (
        <div class={className.value} style={style.value}>
          <Render content={icon.value || IconMap[status.value]}></Render>
        </div>
      );
    };
  },
});

// eslint-disable-next-line vue/one-component-per-file
const Extra = defineComponent({
  props: ['extra', 'class', 'style'],
  setup(props) {
    const { extra, class: className, style } = toRefs(props);
    return () => {
      if (!extra.value) {
        return null;
      }
      return (
        <div class={className.value} style={style.value}>
          <Render content={extra.value}></Render>
        </div>
      );
    };
  },
});

const {
  getPrefixCls,
  direction,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('result'));

const [mergedClassNames, mergedStyles] = useMergeSemantic(
  computed(() => [contextClassNames?.value, resultClassNames]),
  computed(() => [contextStyles?.value, styles]),
);

const prefixCls = computed(() => getPrefixCls.value('result', customizePrefixCls));

// Style
const [hashId, cssVarCls] = useStyle(prefixCls);

const rootClassNames = computed(() =>
  clsx(
    prefixCls.value,
    `${prefixCls.value}-${status}`,
    customizeClassName,
    contextClassName?.value,
    rootClassName,
    { [`${prefixCls.value}-rtl`]: direction?.value === 'rtl' },
    hashId.value,
    cssVarCls.value,
    mergedClassNames?.value?.root,
  ),
);

const titleClassNames = computed(() => clsx(`${prefixCls.value}-title`, mergedClassNames?.value?.title));

const subTitleClassNames = computed(() => clsx(`${prefixCls.value}-subtitle`, mergedClassNames?.value?.subTitle));

const extraClassNames = computed(() => clsx(`${prefixCls.value}-extra`, mergedClassNames?.value?.extra));

const bodyClassNames = computed(() => clsx(`${prefixCls.value}-body`, mergedClassNames?.value?.body));

const iconClassNames = computed(() =>
  clsx(
    `${prefixCls.value}-icon`,
    { [`${prefixCls.value}-image`]: ExceptionStatus.includes(`${status}`) },
    mergedClassNames?.value?.icon,
  ),
);

const rootStyles = computed<CSSProperties>(() => ({
  ...mergedStyles?.value?.root,
  ...contextStyle?.value,
  ...style,
}));
</script>
<template>
  <div :class="rootClassNames" :style="rootStyles">
    <Icon :class="iconClassNames" :style="mergedStyles?.icon" :status="status" :icon="iconSlot" />
    <div :class="titleClassNames" :style="mergedStyles?.title"><Render :content="titleSlot" /></div>
    <div v-if="subTitleSlot" :class="subTitleClassNames" :style="mergedStyles?.subTitle"><Render :content="subTitleSlot" /></div>
    <Extra :class="extraClassNames" :extra="extraSlot" :style="mergedStyles?.extra" />
    <div v-if="slots.default" :class="bodyClassNames" :style="mergedStyles?.body"><slot></slot></div>
  </div>
</template>
