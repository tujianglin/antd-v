<script lang="tsx" setup>
import { QRCodeCanvas, QRCodeSVG } from '@/vc-component/qrcode';
import pickAttrs from '@/vc-util/pickAttrs';
import clsx from 'clsx';
import { omit } from 'lodash-es';
import { computed, getCurrentInstance, toRefs } from 'vue';
import { useMergeSemantic } from '../_util/hooks';
import { useComponentConfig } from '../config-provider/context';
import { useLocale } from '../locale';
import { useToken } from '../theme/internal';
import type { QRCodeClassNamesType, QRCodeProps, QRCodeStylesType, QRProps } from './interface';
import QRcodeStatus from './QrcodeStatus';
import useStyle from './style/index';

export type { QRCodeProps, QRProps };

defineOptions({ name: 'QRCode', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  value,
  type = 'canvas',
  icon = '',
  size = 160,
  iconSize,
  color: customColor,
  errorLevel = 'M',
  status = 'active',
  bordered = true,
  onRefresh,
  style,
  class: className,
  rootClassName,
  prefixCls: customizePrefixCls,
  bgColor = 'transparent',
  statusRender,
  classNames,
  styles,
  boostLevel,
  ...rest
} = defineProps<QRCodeProps>();

const [, token] = useToken();

const color = computed(() => customColor || token.value?.colorText);

const {
  getPrefixCls,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('qrcode'));

const vm = getCurrentInstance();
const [mergedClassNames, mergedStyles] = useMergeSemantic<QRCodeClassNamesType, QRCodeStylesType, QRCodeProps>(
  computed(() => [contextClassNames?.value, classNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({
    props: {
      ...vm.props,
      bgColor,
      type,
      size,
      status,
      bordered,
      errorLevel,
    } as QRCodeProps,
  })),
);

const prefixCls = computed(() => getPrefixCls.value('qrcode', customizePrefixCls));

const [hashId, cssVarCls] = useStyle(prefixCls);

const imageSettings = computed<QRProps['imageSettings']>(() => ({
  src: icon,
  x: undefined,
  y: undefined,
  height: typeof iconSize === 'number' ? iconSize : (iconSize?.height ?? 40),
  width: typeof iconSize === 'number' ? iconSize : (iconSize?.width ?? 40),
  excavate: true,
  crossOrigin: 'anonymous',
}));

const a11yProps = computed(() => pickAttrs(rest, true));

const restProps = computed(() => omit(rest, Object.keys(a11yProps)));

const qrCodeProps = computed(() => ({
  value,
  size,
  level: errorLevel,
  bgColor,
  fgColor: color.value,
  style: { width: style?.width, height: style?.height },
  imageSettings: icon ? imageSettings?.value : undefined,
  boostLevel,
  ...a11yProps?.value,
}));

const [locale] = useLocale('QRCode');

const rootClassNames = computed(() =>
  clsx(
    prefixCls.value,
    className,
    rootClassName,
    hashId.value,
    cssVarCls.value,
    contextClassName?.value,
    mergedClassNames?.value?.root,
    {
      [`${prefixCls.value}-borderless`]: !bordered,
    },
  ),
);

const rootStyle = computed(() => ({
  backgroundColor: bgColor,
  ...mergedStyles?.value?.root,
  ...contextStyle?.value,
  ...style,
  width: `${style?.width ?? size}px`,
  height: `${style?.height ?? size}px`,
}));
</script>
<template>
  <div v-if="value" v-bind="restProps" :class="rootClassNames" :style="rootStyle">
    <div v-if="status !== 'active'" :class="clsx(`${prefixCls}-cover`, mergedClassNames.cover)" :style="mergedStyles.cover">
      <QRcodeStatus
        :prefix-cls="prefixCls"
        :locale="locale"
        :status="status as any"
        @refresh="onRefresh"
        :status-render="statusRender"
      />
    </div>
    <QRCodeCanvas v-if="type === 'canvas'" v-bind="{ ...qrCodeProps, ...$attrs }" />
    <QRCodeSVG v-else v-bind="{ ...qrCodeProps, ...$attrs }" />
  </div>
</template>
