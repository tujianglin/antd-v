<script lang="tsx" setup>
import useMergedState from '@/vc-util/hooks/useMergedState';
import type { CSSMotionProps } from '@/vc-component/motion';
import isEqual from '@/vc-util/isEqual';
import warning from '@/vc-util/warning';
import { reactiveComputed } from '@vueuse/core';
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  toRaw,
  toRefs,
  useAttrs,
  watch,
  type CSSProperties,
  type HTMLAttributes,
} from 'vue';
import type { SemanticName } from './SubMenu/index.vue';
import { getFocusableElements, refreshElements, useAccessibility } from './hooks/useAccessibility';
import useKeyRecords, { OVERFLOW_KEY } from './hooks/useKeyRecords';
import useMemoCallback from './hooks/useMemoCallback';
import useUUID from './hooks/useUUID';
import type {
  BuiltinPlacements,
  Components,
  ItemType,
  MenuClickEventHandler,
  MenuInfo,
  MenuMode,
  PopupRender,
  RenderIconType,
  SelectEventHandler,
  SelectInfo,
  TriggerSubMenuAction,
} from './interface';
import { parseItems } from './utils/nodeUtil';
import { warnItemProp } from './utils/warnUtil';
import { MenuContextProvider } from './context/MenuContext';
import { Render } from '@/components';
import Overflow from '@/vc-component/overflow';
import { composeRef } from '@/vc-util/ref';
import clsx from 'clsx';
import SubMenu from './SubMenu/index.vue';
import { PrivateContextProvider } from './context/PrivateContext';
import { IdContextProvider } from './context/IdContext';
import { PathRegisterContextProvider, PathUserContextProvider } from './context/PathContext';
export interface MenuProps extends /** @vue-ignore */ Omit<HTMLAttributes, 'onClick' | 'onSelect' | 'dir' | 'onScroll'> {
  prefixCls?: string;
  rootClassName?: string;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  items: ItemType[];

  disabled?: boolean;
  /** @private Disable auto overflow. Pls note the prop name may refactor since we do not final decided. */
  disabledOverflow?: boolean;

  /** direction of menu */
  direction?: 'ltr' | 'rtl';

  // Mode
  mode?: MenuMode;
  inlineCollapsed?: boolean;

  // Active control
  activeKey?: string;
  defaultActiveFirst?: boolean;

  // Selection
  selectable?: boolean;
  multiple?: boolean;

  onSelect?: SelectEventHandler;
  onDeselect?: SelectEventHandler;

  // Level
  inlineIndent?: number;

  // Motion
  /** Menu motion define. Use `defaultMotions` if you need config motion of each mode */
  motion?: CSSMotionProps;
  /** Default menu motion of each mode */
  // eslint-disable-next-line no-unused-vars
  defaultMotions?: Partial<{ [key in MenuMode | 'other']: CSSMotionProps }>;

  // Popup
  subMenuOpenDelay?: number;
  subMenuCloseDelay?: number;
  forceSubMenuRender?: boolean;
  triggerSubMenuAction?: TriggerSubMenuAction;
  builtinPlacements?: BuiltinPlacements;

  // Icon
  itemIcon?: RenderIconType;
  expandIcon?: RenderIconType;
  overflowedIndicator?: any;
  /** @private Internal usage. Do not use in your production. */
  overflowedIndicatorPopupClassName?: string;

  // >>>>> Function
  getPopupContainer?: (node: HTMLElement) => HTMLElement;

  // >>>>> Events
  onClick?: MenuClickEventHandler;
  onOpenChange?: (openKeys: string[]) => void;

  // >>>>> Internal
  /***
   * @private Only used for `pro-layout`. Do not use in your prod directly
   * and we do not promise any compatibility for this.
   */
  _internalRenderMenuItem?: (
    originNode: any,
    menuItemProps: any,
    stateProps: {
      selected: boolean;
    },
  ) => any;
  /***
   * @private Only used for `pro-layout`. Do not use in your prod directly
   * and we do not promise any compatibility for this.
   */
  _internalRenderSubMenuItem?: (
    originNode: any,
    subMenuItemProps: any,
    stateProps: {
      selected: boolean;
      open: boolean;
      active: boolean;
      disabled: boolean;
    },
  ) => any;

  /**
   * @private NEVER! EVER! USE IN PRODUCTION!!!
   * This is a hack API for `antd` to fix `findDOMNode` issue.
   * Not use it! Not accept any PR try to make it as normal API.
   * By zombieJ
   */
  _internalComponents?: Components;

  popupRender?: PopupRender;
  tabindex?: any;
  id?: string;
  class?: string;
  style?: CSSProperties;
  onKeydown?: (e: KeyboardEvent) => void;
  onScroll?: (e) => void;
}

interface LegacyMenuProps extends MenuProps {
  openTransitionName?: string;
  openAnimation?: string;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls = 'rc-menu',
  rootClassName,
  style,
  class: className,
  styles,
  classNames: menuClassNames,
  tabindex = 0,
  items,
  direction,

  id,

  // Mode
  mode = 'vertical',
  inlineCollapsed,

  // Disabled
  disabled,
  disabledOverflow,

  // Open
  subMenuOpenDelay = 0.1,
  subMenuCloseDelay = 0.1,
  forceSubMenuRender,

  // Active
  activeKey,
  defaultActiveFirst,

  // Selection
  selectable = true,
  multiple = false,
  onSelect,
  onDeselect,

  // Level
  inlineIndent = 24,

  // Motion
  motion,
  defaultMotions,

  // Popup
  triggerSubMenuAction = 'hover',
  builtinPlacements,

  // Icon
  itemIcon,
  expandIcon,
  overflowedIndicator = '...',
  overflowedIndicatorPopupClassName,

  // Function
  getPopupContainer,

  // Events
  onClick,
  onOpenChange,
  onKeydown,

  // Deprecated
  openAnimation,
  openTransitionName,

  // Internal
  _internalRenderMenuItem,
  _internalRenderSubMenuItem,

  _internalComponents,

  popupRender,
  ...restProps
} = defineProps<LegacyMenuProps>();
const EMPTY_LIST: string[] = [];

const childList = computed(() => parseItems(items, EMPTY_LIST, _internalComponents, prefixCls));

const measureChildList = computed(() => parseItems(items, EMPTY_LIST, {}, prefixCls));

const mounted = ref(false);

const containerRef = ref<HTMLUListElement>();

const uuid = useUUID(computed(() => id));

const isRtl = computed(() => direction === 'rtl');

// ========================= Warn =========================
if (process.env.NODE_ENV !== 'production') {
  warning(
    !openAnimation && !openTransitionName,
    '`openAnimation` and `openTransitionName` is removed. Please use `motion` or `defaultMotion` instead.',
  );
}

// ========================= Open =========================
const mergedOpenKeys = defineModel('openKeys', {
  default: undefined,
  get: (val) => {
    return val || EMPTY_LIST;
  },
});

// ref: https://github.com/ant-design/ant-design/issues/38818
const triggerOpenKeys = (keys: string[], forceFlush = false) => {
  function doUpdate() {
    mergedOpenKeys.value = keys;
    onOpenChange?.(keys);
  }

  if (forceFlush) {
    nextTick(doUpdate);
  } else {
    doUpdate();
  }
};

// >>>>> Cache & Reset open keys when inlineCollapsed changed
const inlineCacheOpenKeys = ref(mergedOpenKeys.value);

const mountRef = ref(false);

// ========================= Mode =========================
const { mergedMode, mergedInlineCollapsed } = toRefs(
  reactiveComputed(() => {
    if ((mode === 'inline' || mode === 'vertical') && inlineCollapsed) {
      return { mergedMode: 'vertical' as MenuMode, mergedInlineCollapsed: inlineCollapsed };
    }
    return { mergedMode: mode, mergedInlineCollapsed: false };
  }),
);

const isInlineMode = computed(() => mergedMode.value === 'inline');

const internalMode = ref(mergedMode.value);
const internalInlineCollapsed = ref(mergedInlineCollapsed.value);

watch(
  [mergedMode, mergedInlineCollapsed],
  () => {
    internalMode.value = mergedMode.value;
    internalInlineCollapsed.value = mergedInlineCollapsed.value;
    if (!mountRef.value) {
      return;
    }
    // Synchronously update MergedOpenKeys
    if (isInlineMode.value) {
      mergedOpenKeys.value = inlineCacheOpenKeys.value;
    } else {
      // Trigger open event in case its in control
      triggerOpenKeys(EMPTY_LIST);
    }
  },
  { immediate: true },
);

// ====================== Responsive ======================
const lastVisibleIndex = ref(0);
const allVisible = computed(
  () => lastVisibleIndex.value >= childList.value.length - 1 || internalMode.value !== 'horizontal' || disabledOverflow,
);

// Cache
watch(
  mergedOpenKeys,
  () => {
    if (isInlineMode.value) {
      inlineCacheOpenKeys.value = mergedOpenKeys.value;
    }
  },
  { immediate: true, deep: true },
);

onMounted(() => {
  mountRef.value = true;
});

onBeforeUnmount(() => {
  mountRef.value = false;
});

// ========================= Path =========================
const {
  registerPath,
  unregisterPath,
  refreshOverflowKeys,

  isSubPathKey,
  getKeyPath,
  getKeys,
  getSubPathKeys,
} = useKeyRecords();

const registerPathContext = computed(() => ({ registerPath, unregisterPath }));

const pathUserContext = computed(() => ({ isSubPathKey }));

watch(
  [lastVisibleIndex, allVisible],
  () => {
    refreshOverflowKeys(
      allVisible.value ? EMPTY_LIST : childList.value.slice(lastVisibleIndex.value + 1).map((child) => child.key as string),
    );
  },
  { immediate: true },
);

// ======================== Active ========================
const [mergedActiveKey, setMergedActiveKey] = useMergedState(
  activeKey || ((defaultActiveFirst && childList.value[0]?.key) as string),
  {
    value: computed(() => activeKey),
  },
);

const onActive = useMemoCallback((key: string) => {
  setMergedActiveKey(key);
});

const onInactive = useMemoCallback(() => {
  setMergedActiveKey(undefined);
});

defineExpose({
  get list() {
    return containerRef.value;
  },
  focus: (options) => {
    const keys = getKeys();
    const { elements, key2element, element2key } = refreshElements(keys, uuid.value);
    const focusableElements = getFocusableElements(containerRef.value, elements);

    const shouldFocusKey =
      mergedActiveKey.value ??
      (focusableElements[0]
        ? element2key.get(focusableElements[0])
        : (childList.value.find((node) => !node.props.disabled)?.key as string));

    const elementToFocus = key2element.get(shouldFocusKey);

    if (shouldFocusKey && elementToFocus) {
      elementToFocus?.focus?.(options);
    }
  },
  findItem: ({ key: itemKey }) => {
    const keys = getKeys();
    const { key2element } = refreshElements(keys, uuid.value);
    return key2element.get(itemKey) || null;
  },
});

// ======================== Select ========================
// >>>>> Select keys
const mergedSelectKeys = defineModel('selectedKeys', {
  default: [],
  // Legacy convert key to array
  get: (keys) => {
    if (Array.isArray(keys)) {
      return keys;
    }
    if (keys === null || keys === undefined) {
      return [];
    }
    return [keys];
  },
});

// >>>>> Trigger select
const triggerSelection = (info: MenuInfo) => {
  if (selectable) {
    // Insert or Remove
    const { key: targetKey } = info;
    const exist = mergedSelectKeys.value.includes(targetKey);
    let newSelectKeys: string[];

    if (multiple) {
      if (exist) {
        newSelectKeys = mergedSelectKeys.value.filter((key) => key !== targetKey);
      } else {
        newSelectKeys = [...mergedSelectKeys.value, targetKey];
      }
    } else {
      newSelectKeys = [targetKey];
    }

    mergedSelectKeys.value = mergedSelectKeys.value || newSelectKeys;
    // Trigger event
    const selectInfo: SelectInfo = {
      ...info,
      selectedKeys: newSelectKeys,
    };
    if (exist) {
      onDeselect?.(selectInfo);
    } else {
      onSelect?.(selectInfo);
    }
  }

  // Whatever selectable, always close it
  if (!multiple && mergedOpenKeys.value.length && internalMode.value !== 'inline') {
    triggerOpenKeys(EMPTY_LIST);
  }
};

// ========================= Open =========================
/**
 * Click for item. SubMenu do not have selection status
 */
const onInternalClick = useMemoCallback((info: MenuInfo) => {
  onClick?.(warnItemProp(info));
  triggerSelection(info);
});

const onInternalOpenChange = (key: string, open: boolean) => {
  let newOpenKeys = mergedOpenKeys.value.filter((k) => k !== key);

  if (open) {
    newOpenKeys.push(key);
  } else if (internalMode.value !== 'inline') {
    // We need find all related popup to close
    const subPathKeys = getSubPathKeys(key);
    newOpenKeys = newOpenKeys.filter((k) => !subPathKeys.has(k));
  }

  if (!isEqual(toRaw(mergedOpenKeys.value), newOpenKeys, true)) {
    triggerOpenKeys(newOpenKeys, true);
  }
};

// ==================== Accessibility =====================
const triggerAccessibilityOpen = (key: string, open?: boolean) => {
  const nextOpen = open ?? !mergedOpenKeys.value.includes(key);

  onInternalOpenChange(key, nextOpen);
};

const onInternalKeyDown = useAccessibility(
  internalMode,
  mergedActiveKey,
  isRtl,
  uuid,

  containerRef,
  getKeys,
  getKeyPath,

  setMergedActiveKey,
  triggerAccessibilityOpen,

  onKeydown,
);

// ======================== Effect ========================
onMounted(() => {
  mounted.value = true;
});

// ======================= Context ========================
const privateContext = computed(() => ({
  _internalRenderMenuItem,
  _internalRenderSubMenuItem,
}));

// ======================== Render ========================

// >>>>> Children
const wrappedChildList = () => {
  return internalMode.value !== 'horizontal' || disabledOverflow
    ? childList.value
    : // Need wrap for overflow dropdown that do not response for open
      childList.value.map((child, index) => {
        return (
          // Always wrap provider to avoid sub node re-mount
          <MenuContextProvider
            key={child.key}
            value={{
              overflowDisabled: index > lastVisibleIndex.value,
              classNames: menuClassNames,
              styles,
            }}
          >
            <Render content={child}></Render>
          </MenuContextProvider>
        );
      });
};

const attrs = useAttrs();
// >>>>> Container
const Container = () => {
  return (
    <Overflow
      id={id}
      ref={composeRef((el) => (containerRef.value = el?.el))}
      prefixCls={`${prefixCls}-overflow`}
      component="ul"
      class={clsx(
        prefixCls,
        `${prefixCls}-root`,
        `${prefixCls}-${internalMode.value}`,
        className,
        {
          [`${prefixCls}-inline-collapsed`]: internalInlineCollapsed.value,
          [`${prefixCls}-rtl`]: isRtl.value,
        },
        rootClassName,
      )}
      dir={direction}
      style={style}
      role="menu"
      tabindex={tabindex}
      data={wrappedChildList()}
      renderRawItem={(node) => node}
      renderRawRest={(omitItems) => {
        // We use origin list since wrapped list use context to prevent open
        const len = omitItems.length;

        const originOmitItems = len ? childList.value.slice(-len) : null;
        return (
          <SubMenu
            eventKey={OVERFLOW_KEY}
            title={overflowedIndicator}
            disabled={allVisible.value}
            internalPopupClose={len === 0}
            popupClassName={overflowedIndicatorPopupClassName}
          >
            {originOmitItems}
          </SubMenu>
        );
      }}
      maxCount={internalMode.value !== 'horizontal' || disabledOverflow ? Overflow.INVALIDATE : Overflow.RESPONSIVE}
      ssr="full"
      data-menu-list
      onVisibleChange={(newLastIndex) => {
        lastVisibleIndex.value = newLastIndex;
      }}
      onKeydown={onInternalKeyDown}
      {...restProps}
      {...attrs}
    />
  );
};
</script>
<template>
  <PrivateContextProvider :value="privateContext">
    <IdContextProvider :value="uuid">
      <MenuContextProvider
        :value="{
          prefixCls,
          rootClassName,
          classNames: menuClassNames,
          styles,
          mode: internalMode,
          openKeys: mergedOpenKeys,
          rtl: isRtl,
          disabled,
          motion: mounted ? motion : null,
          defaultMotions: mounted ? defaultMotions : null,
          activeKey: mergedActiveKey,
          onActive,
          onInactive,
          selectedKeys: mergedSelectKeys,
          inlineIndent,
          subMenuOpenDelay,
          subMenuCloseDelay,
          forceSubMenuRender,
          builtinPlacements,
          triggerSubMenuAction,
          getPopupContainer,
          itemIcon,
          expandIcon,
          onItemClick: onInternalClick,
          onOpenChange: onInternalOpenChange,
          popupRender,
        }"
      >
        <PathUserContextProvider :value="pathUserContext">
          <Container />
        </PathUserContextProvider>
        <div :style="{ display: 'none' }" aria-hidden>
          <PathRegisterContextProvider :value="registerPathContext">
            <Render :content="measureChildList" />
          </PathRegisterContextProvider>
        </div>
      </MenuContextProvider>
    </IdContextProvider>
  </PrivateContextProvider>
</template>
