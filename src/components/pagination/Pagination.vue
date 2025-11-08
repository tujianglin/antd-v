<script lang="tsx" setup>
import type { PaginationLocale, PaginationProps as RcPaginationProps } from '@/vc-component/pagination';
import RcPagination from '@/vc-component/pagination';
import enUS from '@/vc-component/pagination/locale/en_US';
import { useComponentConfig } from '../config-provider/context';
import useSize from '../config-provider/hooks/useSize';
import useBreakpoint from '../grid/hooks/useBreakpoint';
import { useLocale } from '../locale';
import type { SelectProps } from '../select';
import Select from '../select';
import { useToken } from '../theme/internal';
import useStyle from './style';
import BorderedStyle from './style/bordered';
import useShowSizeChanger from './useShowSizeChanger';
import type { VueNode } from '@/vc-util/type';
import { computed, getCurrentInstance, toRefs, type CSSProperties } from 'vue';
import clsx from 'clsx';
import { DoubleLeftOutlined, DoubleRightOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons-vue';
import { omit } from 'lodash-es';
import { useMergeSemantic, type SemanticClassNamesType, type SemanticStylesType } from '../_util/hooks';

export type SemanticName = 'root' | 'item';

export type PaginationSemanticName = SemanticName;

export type PaginationClassNamesType = SemanticClassNamesType<PaginationProps, PaginationSemanticName>;

export type PaginationStylesType = SemanticStylesType<PaginationProps, PaginationSemanticName>;

export interface PaginationProps
  extends Omit<RcPaginationProps, 'showSizeChanger' | 'pageSizeOptions' | 'classNames' | 'styles'> {
  showQuickJumper?: boolean | { goButton?: VueNode };
  size?: 'default' | 'small';
  responsive?: boolean;
  role?: string;
  totalBoundaryShowSizeChanger?: number;
  rootClassName?: string;
  showSizeChanger?: boolean | SelectProps;
  /** `string` type will be removed in next major version. */
  pageSizeOptions?: (string | number)[];
  classNames?: PaginationClassNamesType;
  styles?: PaginationStylesType;
}

export type PaginationPosition = 'top' | 'bottom' | 'both';

export interface PaginationConfig extends Omit<PaginationProps, 'rootClassName'> {
  position?: PaginationPosition;
}

export type { PaginationLocale };

defineOptions({ name: 'Pagination', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  align,
  prefixCls: customizePrefixCls,
  selectPrefixCls: customizeSelectPrefixCls,
  class: className,
  rootClassName,
  style,
  size: customizeSize,
  locale: customLocale,
  responsive,
  showSizeChanger,
  pageSizeOptions,
  styles,
  classNames,
  onChange,
  showPrevNextJumpers = true,
  ...restProps
} = defineProps<PaginationProps>();

const pageSize = defineModel('pageSize', { default: 10 });

const current = defineModel('current', { default: 1 });

const breakpoint = useBreakpoint(computed(() => responsive));
const xs = computed(() => breakpoint.value.xs);
const [, token] = useToken();

const {
  getPrefixCls,
  direction,
  showSizeChanger: contextShowSizeChangerConfig,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('pagination'));
const prefixCls = computed(() => getPrefixCls.value('pagination', customizePrefixCls));

// Style
const [hashId, cssVarCls] = useStyle(prefixCls);

// ============================== Size ==============================
const mergedSize = useSize(computed(() => customizeSize));

const isSmall = computed(() => mergedSize.value === 'small' || !!(xs.value && !mergedSize.value && responsive));

const vm = getCurrentInstance();

const [mergedClassNames, mergedStyles] = useMergeSemantic<PaginationClassNamesType, PaginationStylesType, PaginationProps>(
  computed(() => [contextClassNames?.value, classNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({
    props: {
      ...vm.props,
      size: mergedSize.value,
    },
  })),
);

// ============================= Locale =============================
const [contextLocale] = useLocale('Pagination', enUS);

const locale = computed(() => ({ ...contextLocale?.value, ...customLocale }));

// ========================== Size Changer ==========================
// Merge the props showSizeChanger
const [propShowSizeChanger, propSizeChangerSelectProps] = useShowSizeChanger(computed(() => showSizeChanger));
const [contextShowSizeChanger, contextSizeChangerSelectProps] = useShowSizeChanger(contextShowSizeChangerConfig);

const mergedShowSizeChanger = computed(() => propShowSizeChanger?.value ?? contextShowSizeChanger?.value);
const mergedShowSizeChangerSelectProps = computed(
  () => propSizeChangerSelectProps?.value ?? contextSizeChangerSelectProps?.value,
);

// Generate options
const mergedPageSizeOptions = computed(() => {
  return pageSizeOptions ? pageSizeOptions.map((option) => Number(option)) : undefined;
});

// Render size changer
const sizeChangerRender: RcPaginationProps['sizeChangerRender'] = (info) => {
  const { disabled, size: pageSize, onSizeChange, 'aria-label': ariaLabel, class: sizeChangerClassName, options } = info;

  const { class: propSizeChangerClassName, onChange: propSizeChangerOnChange } =
    (mergedShowSizeChangerSelectProps.value as unknown as SelectProps) || {};

  // Origin Select is using Select.Option,
  // So it make the option value must be string
  // Just for compatible
  const selectedValue = options.find((option) => String(option.value) === String(pageSize))?.value;
  return (
    <Select
      {...omit(mergedShowSizeChangerSelectProps.value as any, ['onChange'])}
      disabled={disabled}
      allowClear={false}
      showSearch={{}}
      popupMatchSelectWidth={false}
      getPopupContainer={(triggerNode) => triggerNode.parentNode}
      aria-label={ariaLabel}
      options={options}
      value={selectedValue}
      onChange={(nextSize, option) => {
        onSizeChange?.(nextSize);
        propSizeChangerOnChange?.(nextSize, option);
      }}
      size={isSmall.value ? 'small' : 'middle'}
      class={clsx(sizeChangerClassName, propSizeChangerClassName)}
    />
  );
};

// ============================= Render =============================
const iconsProps = computed<Record<PropertyKey, VueNode>>(() => {
  const Ellipsis = () => <span class={`${prefixCls.value}-item-ellipsis`}>•••</span>;
  const prevIcon = () => (
    <button class={`${prefixCls.value}-item-link`} type="button" tabindex={-1}>
      {direction.value === 'rtl' ? <RightOutlined /> : <LeftOutlined />}
    </button>
  );
  const nextIcon = () => (
    <button class={`${prefixCls.value}-item-link`} type="button" tabindex={-1}>
      {direction.value === 'rtl' ? <LeftOutlined /> : <RightOutlined />}
    </button>
  );
  const jumpPrevIcon = () => (
    // biome-ignore lint/a11y/useValidAnchor: it is hard to refactor
    <a class={`${prefixCls.value}-item-link`}>
      <div class={`${prefixCls.value}-item-container`}>
        {direction.value === 'rtl' ? (
          <DoubleRightOutlined class={`${prefixCls.value}-item-link-icon`} />
        ) : (
          <DoubleLeftOutlined class={`${prefixCls.value}-item-link-icon`} />
        )}
        <Ellipsis></Ellipsis>
      </div>
    </a>
  );
  const jumpNextIcon = () => (
    // biome-ignore lint/a11y/useValidAnchor: it is hard to refactor
    <a class={`${prefixCls.value}-item-link`}>
      <div class={`${prefixCls.value}-item-container`}>
        {direction.value === 'rtl' ? (
          <DoubleLeftOutlined class={`${prefixCls.value}-item-link-icon`} />
        ) : (
          <DoubleRightOutlined class={`${prefixCls.value}-item-link-icon`} />
        )}
        <Ellipsis></Ellipsis>
      </div>
    </a>
  );
  return { prevIcon, nextIcon, jumpPrevIcon, jumpNextIcon };
});

const selectPrefixCls = computed(() => getPrefixCls.value('select', customizeSelectPrefixCls));

const extendedClassName = computed(() =>
  clsx(
    {
      [`${prefixCls.value}-${align}`]: !!align,
      [`${prefixCls.value}-mini`]: isSmall.value,
      [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
      [`${prefixCls.value}-bordered`]: token?.value?.wireframe,
    },
    contextClassName?.value,
    className,
    rootClassName,
    mergedClassNames?.value?.root,
    hashId.value,
    cssVarCls.value,
  ),
);

const mergedStyle = computed<CSSProperties>(() => ({
  ...mergedStyles?.value?.root,
  ...contextStyle?.value,
  ...style,
}));
</script>
<template>
  <BorderedStyle v-if="token.wireframe" :prefix-cls="prefixCls" />
  <RcPagination
    v-bind="{ ...restProps, ...iconsProps }"
    v-model:page-size="pageSize"
    v-model:current="current"
    :show-prev-next-jumpers="showPrevNextJumpers"
    :styles="mergedStyles"
    :class-names="mergedClassNames"
    :style="mergedStyle"
    :prefix-cls="prefixCls"
    :select-prefix-cls="selectPrefixCls"
    :class="extendedClassName"
    :locale="locale"
    :page-size-options="mergedPageSizeOptions"
    :show-size-changer="mergedShowSizeChanger"
    :size-changer-render="sizeChangerRender"
    @change="
      (val1, val2) => {
        current = val1;
        pageSize = val2;
        onChange?.(val1, val2);
      }
    "
  />
</template>
