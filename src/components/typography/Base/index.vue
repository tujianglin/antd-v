<script lang="tsx" setup>
import type { VueNode } from '@/vc-util/type';
import { isStyleSupport } from '../../_util/styleChecker';
import useLocale from '../../locale/useLocale';
import type { TooltipProps } from '../../tooltip';
import Tooltip from '../../tooltip';
import Editable from '../Editable.vue';
import useCopyClick from '../hooks/useCopyClick';
import useMergedConfig from '../hooks/useMergedConfig';
import usePrevious from '../hooks/usePrevious';
import useTooltipProps from '../hooks/useTooltipProps';
import type { TypographyProps } from '../Typography.vue';
import Typography from '../Typography.vue';
import CopyBtn from './CopyBtn.vue';
import Ellipsis from './Ellipsis.vue';
import EllipsisTooltip from './EllipsisTooltip.vue';
import { isEleEllipsis, isValidText } from './util';
import type { AutoSizeType } from '@/vc-component/textarea';
import { computed, createElementVNode, ref, toRefs, useTemplateRef, watch, type VNode } from 'vue';
import { useConfigContextInject } from '@/components/config-provider';
import { omit } from 'lodash-es';
import useControlledState from '@/vc-util/hooks/useControlledState';
import { toArray } from '@/vc-util/Children/toArray';
import { EditOutlined } from '@ant-design/icons-vue';
import ResizeObserver from '@/vc-component/resize-observer';
import clsx from 'clsx';

export type BaseType = 'secondary' | 'success' | 'warning' | 'danger';

export interface CopyConfig {
  text?: string | (() => string | Promise<string>);
  onCopy?: (event?: MouseEvent) => void;
  icon?: VueNode;
  tooltips?: VueNode | boolean;
  format?: 'text/plain' | 'text/html';
  tabindex?: number;
}

interface EditConfig {
  text?: string;
  editing?: boolean;
  icon?: VueNode;
  tooltip?: VueNode | boolean;
  onStart?: () => void;
  onChange?: (value: string) => void;
  onCancel?: () => void;
  onEnd?: () => void;
  maxlength?: number;
  autoSize?: boolean | AutoSizeType;
  triggerType?: ('icon' | 'text')[];
  enterIcon?: VueNode;
  tabindex?: number;
}

export interface EllipsisConfig {
  rows?: number;
  expandable?: boolean | 'collapsible';
  suffix?: string;
  symbol?: VueNode | ((expanded: boolean) => VueNode);
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpand?: (e: MouseEvent, info: { expanded: boolean }) => void;
  onEllipsis?: (ellipsis: boolean) => void;
  tooltip?: VueNode | boolean | TooltipProps;
}

export interface BlockProps extends TypographyProps {
  title?: string;
  editable?: boolean | EditConfig;
  copyable?: boolean | CopyConfig;
  type?: BaseType;
  disabled?: boolean;
  ellipsis?: boolean | EllipsisConfig;
  // decorations
  code?: boolean;
  mark?: boolean;
  underline?: boolean;
  delete?: boolean;
  strong?: boolean;
  keyboard?: boolean;
  italic?: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  style,
  type,
  disabled,
  ellipsis,
  editable,
  copyable = undefined,
  component,
  title,
  ...restProps
} = defineProps<BlockProps>();

const slots = defineSlots<{
  default(): () => VNode[];
}>();

const children = computed(() => slots.default?.());
function wrapperDecorations({ mark, code, underline, delete: del, strong, keyboard, italic }: BlockProps, content: VueNode) {
  let currentContent = content;

  function wrap(tag: string, needed?: boolean) {
    if (!needed) {
      return;
    }
    currentContent = createElementVNode(tag, {}, (currentContent as any)?.children);
  }

  wrap('strong', strong);
  wrap('u', underline);
  wrap('del', del);
  wrap('code', code);
  wrap('mark', mark);
  wrap('kbd', keyboard);
  wrap('i', italic);

  return currentContent;
}

const ELLIPSIS_STR = '...';

const DECORATION_PROPS = ['delete', 'mark', 'code', 'underline', 'strong', 'keyboard', 'italic'] as const;

const { getPrefixCls, direction } = toRefs(useConfigContextInject());
const [textLocale] = useLocale('Text');

const typographyRef = useTemplateRef('typographyRef');
const editIconRef = ref<HTMLButtonElement>(null);

// ============================ MISC ============================
const prefixCls = getPrefixCls.value('typography', customizePrefixCls);

const textProps = computed(() => omit(restProps, DECORATION_PROPS));

// ========================== Editable ==========================
const [enableEdit, editConfig] = useMergedConfig<EditConfig>(computed(() => editable));
const [editing, setEditing] = useControlledState(
  false,
  computed(() => editConfig.value?.editing),
);
const triggerType = computed(() => editConfig.value.triggerType || ['icon']);

const triggerEdit = (edit: boolean) => {
  if (edit) {
    editConfig?.value?.onStart?.();
  }

  setEditing(edit);
};

// Focus edit icon when back
const prevEditing = usePrevious(editing);
watch(
  editing,
  () => {
    if (!editing.value && prevEditing.value) {
      editIconRef.value?.focus();
    }
  },
  { flush: 'post', immediate: true },
);

const onEditClick = (e?: MouseEvent) => {
  e?.preventDefault();
  triggerEdit(true);
};

const onEditChange = (value: string) => {
  editConfig?.value?.onChange?.(value);
  triggerEdit(false);
};

const onEditCancel = () => {
  editConfig?.value?.onCancel?.();
  triggerEdit(false);
};

// ========================== Copyable ==========================
const [enableCopy, copyConfig] = useMergedConfig<CopyConfig>(computed(() => copyable));

const { copied, copyLoading, onClick: onCopyClick } = useCopyClick(copyConfig, children);

// ========================== Ellipsis ==========================
const isLineClampSupport = ref(false);
const isTextOverflowSupport = ref(false);

const isJsEllipsis = ref(false);
const isNativeEllipsis = ref(false);
const isNativeVisible = ref(true);
const [enableEllipsis, ellipsisConfig] = useMergedConfig<EllipsisConfig>(
  computed(() => ellipsis),
  computed(() => ({
    expandable: false,
    symbol: (isExpanded) => (isExpanded ? textLocale?.value?.collapse : textLocale?.value?.expand),
  })),
);
const [expanded, setExpanded] = useControlledState(
  ellipsisConfig.value?.defaultExpanded || false,
  computed(() => ellipsisConfig.value?.expanded),
);

const mergedEnableEllipsis = computed(
  () => enableEllipsis.value && (!expanded.value || ellipsisConfig.value.expandable === 'collapsible'),
);

// Shared prop to reduce bundle size
const rows = computed(() => ellipsisConfig.value?.rows || 1);

const needMeasureEllipsis = computed(() => {
  return (
    mergedEnableEllipsis.value &&
    // Provide suffix
    (ellipsisConfig.value.suffix !== undefined ||
      ellipsisConfig.value.onEllipsis ||
      // Can't use css ellipsis since we need to provide the place for button
      ellipsisConfig.value.expandable ||
      enableEdit.value ||
      enableCopy.value)
  );
});

watch(
  [needMeasureEllipsis, enableEllipsis],
  () => {
    if (enableEllipsis.value && !needMeasureEllipsis.value) {
      isLineClampSupport.value = isStyleSupport('webkitLineClamp');
      isTextOverflowSupport.value = isStyleSupport('textOverflow');
    }
  },
  { flush: 'post', immediate: true, deep: true },
);

const cssEllipsis = ref(mergedEnableEllipsis.value);

const canUseCssEllipsis = computed(() => {
  if (needMeasureEllipsis.value) {
    return false;
  }

  if (rows.value === 1) {
    return isTextOverflowSupport.value;
  }

  return isLineClampSupport.value;
});

// We use effect to change from css ellipsis to js ellipsis.
// To make SSR still can see the ellipsis.
watch(
  [canUseCssEllipsis, mergedEnableEllipsis],
  () => {
    cssEllipsis.value = canUseCssEllipsis.value && mergedEnableEllipsis.value;
  },
  { flush: 'post', immediate: true },
);

const isMergedEllipsis = computed(
  () => mergedEnableEllipsis.value && (cssEllipsis.value ? isNativeEllipsis.value : isJsEllipsis.value),
);

const cssTextOverflow = computed(() => mergedEnableEllipsis.value && rows.value === 1 && cssEllipsis.value);
const cssLineClamp = computed(() => mergedEnableEllipsis.value && rows.value > 1 && cssEllipsis.value);

// >>>>> Expand
const onExpandClick: EllipsisConfig['onExpand'] = (e, info) => {
  setExpanded(info.expanded);
  ellipsisConfig?.value?.onExpand?.(e, info);
};

const ellipsisWidth = ref(0);
const onResize = ({ offsetWidth }: { offsetWidth: number }) => {
  ellipsisWidth.value = offsetWidth;
};

// >>>>> JS Ellipsis
const onJsEllipsis = (jsEllipsis: boolean) => {
  // Trigger if changed
  if (isJsEllipsis.value !== jsEllipsis) {
    ellipsisConfig?.value?.onEllipsis?.(jsEllipsis);
  }
  isJsEllipsis.value = jsEllipsis;
};

// >>>>> Native ellipsis
watch([enableEllipsis, cssEllipsis, cssLineClamp, isNativeVisible, ellipsisWidth], () => {
  const textEle = typographyRef.value?.el;

  if (enableEllipsis.value && cssEllipsis.value && textEle) {
    const currentEllipsis = isEleEllipsis(textEle);

    if (isNativeEllipsis.value !== currentEllipsis) {
      isNativeEllipsis.value = currentEllipsis;
    }
  }
});

// https://github.com/ant-design/ant-design/issues/36786
// Use IntersectionObserver to check if element is invisible
watch([cssEllipsis, mergedEnableEllipsis], () => {
  const textEle = typographyRef.value?.el;
  if (typeof IntersectionObserver === 'undefined' || !textEle || !cssEllipsis.value || !mergedEnableEllipsis.value) {
    return;
  }

  const observer = new IntersectionObserver(() => {
    isNativeVisible.value = !!textEle.offsetParent;
  });
  observer.observe(textEle!);

  return () => {
    observer.disconnect();
  };
});

// ========================== Tooltip ===========================
const tooltipProps = useTooltipProps(
  computed(() => ellipsisConfig.value.tooltip),
  computed(() => editConfig.value.text),
  children,
);

const topAriaLabel = computed(() => {
  if (!enableEllipsis.value || cssEllipsis.value) {
    return undefined;
  }
  return [editConfig.value.text, children.value, title, tooltipProps.value.title].find(isValidText);
});

// >>>>>>>>>>> Typography
// Expand
const renderExpand = () => {
  const { expandable, symbol } = ellipsisConfig.value;
  return expandable ? (
    <button
      type="button"
      key="expand"
      class={`${prefixCls}-${expanded.value ? 'collapse' : 'expand'}`}
      onClick={(e) => onExpandClick(e!, { expanded: !expanded.value })}
      aria-label={expanded.value ? textLocale?.value.collapse : textLocale?.value?.expand}
    >
      {typeof symbol === 'function' ? (symbol as any)(expanded.value) : symbol}
    </button>
  ) : null;
};

// Edit
const renderEdit = () => {
  if (!enableEdit.value) {
    return;
  }

  const { icon, tooltip, tabindex } = editConfig.value;

  const editTitle = toArray(tooltip as any)[0] || textLocale.value?.edit;
  const ariaLabel = typeof editTitle === 'string' ? editTitle : '';

  return triggerType.value.includes('icon') ? (
    <Tooltip key="edit" title={(tooltip as any) === false ? '' : editTitle}>
      <button
        type="button"
        ref={editIconRef}
        class={`${prefixCls}-edit`}
        onClick={onEditClick}
        aria-label={ariaLabel}
        tabindex={tabindex}
      >
        {icon || <EditOutlined role="button" />}
      </button>
    </Tooltip>
  ) : null;
};

// Copy
const renderCopy = () => {
  if (!enableCopy.value) {
    return null;
  }
  return (
    <CopyBtn
      key="copy"
      {...copyConfig.value}
      prefixCls={prefixCls}
      copied={copied.value}
      locale={textLocale.value}
      onCopy={onCopyClick}
      loading={copyLoading.value}
      iconOnly={children.value === null || children.value === undefined}
    />
  );
};

const renderOperations = (canEllipsis: boolean) => [canEllipsis && renderExpand(), renderEdit(), renderCopy()];

const renderEllipsis = (canEllipsis: boolean) => [
  canEllipsis && !expanded.value && (
    <span aria-hidden key="ellipsis">
      {ELLIPSIS_STR}
    </span>
  ),
  ellipsisConfig.value.suffix,
  renderOperations(canEllipsis),
];

const renderWrapper = (props, node, canEllipsis) => {
  return wrapperDecorations(
    props,
    <>
      {node.length > 0 && canEllipsis && !expanded.value && topAriaLabel.value ? (
        <span key="show-content" aria-hidden>
          {node}
        </span>
      ) : (
        node
      )}
      {renderEllipsis(canEllipsis)}
    </>,
  );
};
</script>
<template>
  <Editable
    v-if="editing"
    :value="editConfig.text ?? (typeof children === 'string' ? children : '')"
    @save="onEditChange"
    @cancel="onEditCancel"
    :prefix-cls="prefixCls"
    :class="className"
    :style="style"
    :direction="direction"
    :maxlength="editConfig.maxlength"
    :auto-size="editConfig.autoSize"
    :enter-icon="editConfig.enterIcon"
  />
  <ResizeObserver v-else @resize="onResize" :disabled="!mergedEnableEllipsis">
    <EllipsisTooltip :tooltip-props="tooltipProps" :enable-ellipsis="mergedEnableEllipsis" :is-ellipsis="isMergedEllipsis">
      <Typography
        :class="
          clsx(
            {
              [`${prefixCls}-${type}`]: type,
              [`${prefixCls}-disabled`]: disabled,
              [`${prefixCls}-ellipsis`]: enableEllipsis,
              [`${prefixCls}-ellipsis-single-line`]: cssTextOverflow,
              [`${prefixCls}-ellipsis-multiple-line`]: cssLineClamp,
            },
            className,
          )
        "
        :prefix-cls="customizePrefixCls"
        :style="{ ...style, WebkitLineClamp: cssLineClamp ? rows : undefined }"
        :component="component"
        ref="typographyRef"
        :direction="direction"
        @click="(e) => (triggerType.includes('text') ? onEditClick(e) : undefined)"
        :aria-label="topAriaLabel?.toString()"
        :title="title"
        v-bind="textProps"
      >
        <Ellipsis
          :enable-measure="mergedEnableEllipsis && !cssEllipsis"
          :text="children"
          :rows="rows"
          :width="ellipsisWidth"
          @ellipsis="onJsEllipsis"
          :expanded="expanded"
          :misc-deps="[ 
            copied,
                expanded,
                copyLoading,
                enableEdit,
                enableCopy,
                textLocale,
                ...DECORATION_PROPS.map((key) => $props[key as keyof BlockProps])
          ]"
        >
          <template #default="{ cutChildren: node, canEllipsis }">
            <component :is="renderWrapper($props, node, canEllipsis)" />
          </template>
        </Ellipsis>
      </Typography>
    </EllipsisTooltip>
  </ResizeObserver>
</template>
