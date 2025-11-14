<script lang="tsx" setup>
import { computed, getCurrentInstance, toRefs, type CSSProperties } from 'vue';
import { useMergeSemantic } from '../_util/hooks';
import Button from '../button';
import { useConfigContextInject } from '../config-provider';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { useGroupContextInject } from './context';
import {
  floatButtonPrefixCls,
  type FloatButtonClassNamesType,
  type FloatButtonProps,
  type FloatButtonStylesType,
} from './interface';
import useStyle from './style';
import { FileTextOutlined } from '@ant-design/icons-vue';
import { useZIndex } from '../_util/hooks/useZIndex';
import clsx from 'clsx';
import Render from '@/vc-component/render';
import { omit } from 'es-toolkit/compat';
import { isEmpty } from 'es-toolkit/compat';
import convertToTooltipProps from '../_util/convertToTooltipProps';
import Badge from '../badge';
import Tooltip from '../tooltip';

defineOptions({ name: 'FloatButton', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  rootClassName,
  style,
  type = 'default',
  shape = 'circle',
  icon,
  content,
  tooltip,
  badge = {},
  classNames,
  styles,
  ...restProps
} = defineProps<FloatButtonProps>();

const {
  shape: contextShape,
  individual: contextIndividual,
  classNames: groupPassedClassNames,
  styles: groupPassedStyles,
} = toRefs(useGroupContextInject());
const { getPrefixCls, direction } = toRefs(useConfigContextInject());
const prefixCls = computed(() => getPrefixCls.value(floatButtonPrefixCls, customizePrefixCls));
const rootCls = useCSSVarCls(prefixCls);

const mergedShape = computed(() => contextShape?.value || shape);
const mergedIndividual = computed(() => contextIndividual?.value ?? true);

const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

const floatButtonClassNames = computed(() => {
  return {
    icon: `${prefixCls.value}-icon`,
    content: `${prefixCls.value}-content`,
  };
});

// =========== Merged Props for Semantic ==========
const vm = getCurrentInstance();
const mergedProps = computed(() => {
  return {
    ...vm.props,
    type,
    shape: mergedShape.value,
  } as FloatButtonProps;
});

const [mergedClassNames, mergedStyles] = useMergeSemantic<FloatButtonClassNamesType, FloatButtonStylesType, FloatButtonProps>(
  computed(() => [floatButtonClassNames.value, groupPassedClassNames?.value, classNames]),
  computed(() => [groupPassedStyles?.value, styles]),
  computed(() => ({ props: mergedProps.value })),
);

const mergedIcon = computed(() => (!content && !icon ? <FileTextOutlined></FileTextOutlined> : icon));

const [zIndex] = useZIndex(
  'FloatButton',
  computed(() => style?.zIndex as number),
);

const mergedStyle = computed((): CSSProperties => ({ ...style, zIndex: zIndex.value }));

// ============================ Badge =============================
// 虽然在 ts 中已经 omit 过了，但是为了防止多余的属性被透传进来，这里再 omit 一遍，以防万一
const badgeProps = computed(() => omit(badge, ['title', 'children', 'status', 'text'] as any[]) as typeof badge);

// =========================== Tooltip ============================
const tooltipProps = convertToTooltipProps(tooltip);

const classes = computed(() => {
  return clsx(
    hashId.value,
    cssVarCls.value,
    rootCls.value,
    prefixCls.value,
    className,
    rootClassName,
    `${prefixCls.value}-${type}`,
    `${prefixCls.value}-${mergedShape.value}`,
    {
      [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
      [`${prefixCls.value}-individual`]: mergedIndividual.value,
      [`${prefixCls.value}-icon-only`]: !content,
    },
  );
});
</script>
<template>
  <template v-if="tooltipProps">
    <Tooltip v-bind="tooltipProps">
      <Button
        v-bind="{ ...restProps as any }"
        :class="classes"
        :class-names="mergedClassNames"
        :styles="mergedStyles"
        :style="mergedStyle"
        :shape="mergedShape"
        :type="type"
        size="large"
        :icon="mergedIcon"
      >
        <Render :content="content" />
        <Badge
          v-if="!isEmpty(badge)"
          v-bind="badgeProps"
          :class="
            clsx(badgeProps.class, `${prefixCls}-badge`, {
              [`${prefixCls}-badge-dot`]: badgeProps.dot,
            })
          "
        />
      </Button>
    </Tooltip>
  </template>
  <Button
    v-else
    v-bind="{ ...restProps as any }"
    :class="classes"
    :class-names="mergedClassNames"
    :styles="mergedStyles"
    :style="mergedStyle"
    :shape="mergedShape"
    :type="type"
    size="large"
    :icon="mergedIcon"
  >
    <Render :content="content" />
    <Badge
      v-if="!isEmpty(badge)"
      v-bind="badgeProps"
      :class="
        clsx(badgeProps.class, `${prefixCls}-badge`, {
          [`${prefixCls}-badge-dot`]: badgeProps.dot,
        })
      "
    />
  </Button>
</template>
