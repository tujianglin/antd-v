<script lang="tsx" setup>
import { computed, type CSSProperties } from 'vue';
import useMergeSemantic from '../_util/hooks/useMergeSemantic';
import Button from '../button';
import { useConfigContextInject } from '../config-provider';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { useGroupContextInject } from './context';
import { floatButtonPrefixCls, type FloatButtonProps } from './interface';
import useStyle from './style';
import { FileTextOutlined } from '@ant-design/icons-vue';
import { useZIndex } from '../_util/hooks/useZIndex';
import { cn } from '@/utils/cn';
import Render from '../render';

defineOptions({ name: 'FloatButton' });

const {
  prefixCls: customizePrefixCls,
  class: className,
  rootClassName,
  style,
  type = 'default',
  shape = 'circle',
  icon,
  content,
  // tooltip,
  // badge = {},
  classNames,
  styles,
  ...restProps
} = defineProps<FloatButtonProps>();

const { getPrefixCls, direction } = useConfigContextInject();
const groupContext = useGroupContextInject();
const prefixCls = getPrefixCls(floatButtonPrefixCls, customizePrefixCls);
const rootCls = useCSSVarCls(prefixCls);

const {
  shape: contextShape,
  individual: contextIndividual,
  classNames: groupPassedClassNames,
  styles: groupPassedStyles,
} = groupContext || {};

const mergedShape = computed(() => contextShape || shape);
const mergedIndividual = computed(() => contextIndividual ?? true);

const mergedContent = computed(() => content);

const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

const floatButtonClassNames = {
  icon: `${prefixCls}-icon`,
  content: `${prefixCls}-content`,
};

const merged = useMergeSemantic(
  computed(() => [
    floatButtonClassNames,
    // contextClassNames,
    groupPassedClassNames,
    classNames,
  ]),
  computed(() => [
    // contextStyles,
    groupPassedStyles,
    styles,
  ]),
);

const mergedIcon = computed(() => (!mergedContent.value && !icon ? <FileTextOutlined></FileTextOutlined> : icon));

const [zIndex] = useZIndex('FloatButton', style?.zIndex as number);

const mergedStyle = computed((): CSSProperties => ({ ...style, zIndex }));

const classes = computed(() => {
  return cn(
    hashId,
    cssVarCls,
    rootCls,
    prefixCls,
    className,
    rootClassName,
    `${prefixCls}-${type}`,
    `${prefixCls}-${mergedShape.value}`,
    {
      [`${prefixCls}-rtl`]: direction === 'rtl',
      [`${prefixCls}-individual`]: mergedIndividual,
      [`${prefixCls}-icon-only`]: !mergedContent.value,
    },
  );
});
</script>
<template>
  <Button
    v-bind="{ ...restProps }"
    :class="classes"
    :class-names="merged.mergedClassNames"
    :styles="merged.mergedStyles"
    :style="mergedStyle"
    :shape="mergedShape"
    :type="type"
    size="large"
    :icon="mergedIcon"
  >
    <Render :content="mergedContent" />
  </Button>
</template>
