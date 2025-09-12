<script lang="tsx" setup>
import { reactiveComputed } from '@vueuse/core';
import { computed, getCurrentInstance, ref, toRefs, watch, type CSSProperties, type Ref } from 'vue';
import type { GetIndicatorSize } from '../hooks/useIndicator';
import useOffsets from '../hooks/useOffsets';
import useSyncState from '../hooks/useSyncState';
import useTouchMove from '../hooks/useTouchMove';
import useUpdate, { useUpdateState } from '../hooks/useUpdate';
import useVisibleRange from '../hooks/useVisibleRange';
import type {
  AnimatedConfig,
  EditableConfig,
  MoreProps,
  OnTabScroll,
  RenderTabBar,
  SizeInfo,
  TabPosition,
  TabSizeMap,
  TabsLocale,
} from '../interface';
import { useTabContextInject } from '../TabContext';
import type { SemanticName } from '../Tabs.vue';
import { genDataNodeKey, getRemovable } from '../util';
import TabNode from './TabNode.vue';
import useIndicator from '../hooks/useIndicator';
import ResizeObserver from '@/vc-component/resize-observer';
import clsx from 'clsx';
import ExtraContent from './ExtraContent.vue';
import AddButton from './AddButton.vue';
import OperationNode from './OperationNode.vue';

export interface TabNavListProps {
  id: any;
  tabPosition: TabPosition;
  activeKey: any;
  rtl: boolean;
  animated?: AnimatedConfig;
  extra?: any;
  editable?: EditableConfig;
  more?: MoreProps;
  mobile: boolean;
  tabBarGutter?: number;
  renderTabBar?: RenderTabBar;
  style?: CSSProperties;
  class?: string;
  locale?: TabsLocale;
  onTabClick: (activeKey: string, e: MouseEvent | KeyboardEvent) => void;
  onTabScroll?: OnTabScroll;
  getPopupContainer?: (node: HTMLElement) => HTMLElement;
  popupClassName?: string;
  indicator?: {
    size?: GetIndicatorSize;
    align?: 'start' | 'center' | 'end';
  };
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  class: className,
  style,
  id,
  animated,
  activeKey,
  rtl,
  extra,
  editable,
  locale,
  tabPosition,
  tabBarGutter,
  onTabClick,
  onTabScroll,
  indicator,
  classNames: tabsClassNames,
  styles,
} = defineProps<TabNavListProps>();

const getTabSize = (tab: HTMLElement, containerRect: { left: number; top: number }) => {
  // tabListRef
  const { offsetWidth, offsetHeight, offsetTop, offsetLeft } = tab;
  const { width, height, left, top } = tab.getBoundingClientRect();

  // Use getBoundingClientRect to avoid decimal inaccuracy
  if (Math.abs(width - offsetWidth) < 1) {
    return [width, height, left - containerRect.left, top - containerRect.top];
  }

  return [offsetWidth, offsetHeight, offsetLeft, offsetTop];
};

const getSize = (refObj: Ref<HTMLElement>): SizeInfo => {
  const { offsetWidth = 0, offsetHeight = 0 } = refObj.value || {};

  // Use getBoundingClientRect to avoid decimal inaccuracy
  if (refObj.value) {
    const { width, height } = refObj.value.getBoundingClientRect();

    if (Math.abs(width - offsetWidth) < 1) {
      return [width, height];
    }
  }

  return [offsetWidth, offsetHeight];
};

/**
 * Convert `SizeInfo` to unit value. Such as [123, 456] with `top` position get `123`
 */
const getUnitValue = (size: SizeInfo, tabPositionTopOrBottom: boolean) => {
  return size[tabPositionTopOrBottom ? 0 : 1];
};

const { prefixCls, tabs } = toRefs(useTabContextInject());
const containerRef = ref<HTMLDivElement>(null);
const extraLeftRef = ref<HTMLDivElement>(null);
const extraRightRef = ref<HTMLDivElement>(null);
const tabsWrapperRef = ref<HTMLDivElement>(null);
const tabListRef = ref<HTMLDivElement>(null);
const operationsRef = ref<HTMLDivElement>(null);
const innerAddButtonRef = ref<HTMLButtonElement>(null);

const tabPositionTopOrBottom = computed(() => tabPosition === 'top' || tabPosition === 'bottom');

const [transformLeft, setTransformLeft] = useSyncState(0, (next, prev) => {
  if (tabPositionTopOrBottom.value && onTabScroll) {
    onTabScroll({ direction: next > prev ? 'left' : 'right' });
  }
});
const [transformTop, setTransformTop] = useSyncState(0, (next, prev) => {
  if (!tabPositionTopOrBottom.value && onTabScroll) {
    onTabScroll({ direction: next > prev ? 'top' : 'bottom' });
  }
});

const containerExcludeExtraSize = ref<SizeInfo>([0, 0]);
const tabContentSize = ref<SizeInfo>([0, 0]);
const addSize = ref<SizeInfo>([0, 0]);
const operationSize = ref<SizeInfo>([0, 0]);

const [tabSizes, setTabSizes] = useUpdateState<TabSizeMap>(new Map());
const tabOffsets = useOffsets(
  tabs,
  tabSizes,
  computed(() => tabContentSize.value[0]),
);

// ========================== Unit =========================
const containerExcludeExtraSizeValue = computed(() => {
  return getUnitValue(containerExcludeExtraSize.value, tabPositionTopOrBottom.value);
});
const tabContentSizeValue = computed(() => {
  return getUnitValue(tabContentSize.value, tabPositionTopOrBottom.value);
});
const addSizeValue = computed(() => getUnitValue(addSize.value, tabPositionTopOrBottom.value));
const operationSizeValue = computed(() => getUnitValue(operationSize.value, tabPositionTopOrBottom.value));

const needScroll = computed(() => {
  return Math.floor(containerExcludeExtraSizeValue.value) < Math.floor(tabContentSizeValue.value + addSizeValue.value);
});
const visibleTabContentValue = computed(() => {
  return needScroll.value
    ? containerExcludeExtraSizeValue.value - operationSizeValue.value
    : containerExcludeExtraSizeValue.value - addSizeValue.value;
});

// ========================== Util =========================
const operationsHiddenClassName = computed(() => `${prefixCls?.value}-nav-operations-hidden`);

const { transformMin, transformMax } = toRefs(
  reactiveComputed(() => {
    let transformMin = 0;
    let transformMax = 0;

    if (!tabPositionTopOrBottom.value) {
      transformMin = Math.min(0, visibleTabContentValue.value - tabContentSizeValue.value);
      transformMax = 0;
    } else if (rtl) {
      transformMin = 0;
      transformMax = Math.max(0, tabContentSizeValue.value - visibleTabContentValue.value);
    } else {
      transformMin = Math.min(0, visibleTabContentValue.value - tabContentSizeValue.value);
      transformMax = 0;
    }
    return { transformMin, transformMax };
  }),
);

function alignInRange(value: number): number {
  if (value < transformMin.value) {
    return transformMin.value;
  }
  if (value > transformMax.value) {
    return transformMax.value;
  }
  return value;
}

// ========================= Mobile ========================
const touchMovingRef = ref<ReturnType<typeof setTimeout>>(null);

const lockAnimation = ref<number>();

function doLockAnimation() {
  lockAnimation.value = Date.now();
}

function clearTouchMoving() {
  if (touchMovingRef.value) {
    clearTimeout(touchMovingRef.value);
  }
}

useTouchMove(tabsWrapperRef, (offsetX, offsetY) => {
  function doMove(setState, offset: number) {
    setState((value) => {
      const newValue = alignInRange(value + offset);
      return newValue;
    });
  }

  // Skip scroll if place is enough
  if (!needScroll.value) {
    return false;
  }

  if (tabPositionTopOrBottom.value) {
    doMove(setTransformLeft, offsetX);
  } else {
    doMove(setTransformTop, offsetY);
  }

  clearTouchMoving();
  doLockAnimation();

  return true;
});

watch(
  lockAnimation,
  () => {
    clearTouchMoving();
    if (lockAnimation.value) {
      touchMovingRef.value = setTimeout(() => {
        lockAnimation.value = 0;
      }, 100);
    }

    return clearTouchMoving;
  },
  { immediate: true },
);
const vm = getCurrentInstance();
// ===================== Visible Range =====================
// Render tab node & collect tab offset
const { visibleStart, visibleEnd } = toRefs(
  useVisibleRange(
    tabOffsets,
    // Container
    visibleTabContentValue,
    // Transform
    computed(() => (tabPositionTopOrBottom.value ? transformLeft.value : transformTop.value)),
    // Tabs
    tabContentSizeValue,
    // Add
    addSizeValue,
    // Operation
    operationSizeValue,
    reactiveComputed(() => ({ ...(vm.props as any), tabs: tabs.value })),
  ),
);

// ========================= Scroll ========================
const scrollToTab = (key = activeKey) => {
  const tabOffset = tabOffsets.value.get(key) || {
    width: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
  };

  if (tabPositionTopOrBottom.value) {
    // ============ Align with top & bottom ============
    let newTransform = transformLeft.value;

    // RTL
    if (rtl) {
      if (tabOffset.right < transformLeft.value) {
        newTransform = tabOffset.right;
      } else if (tabOffset.right + tabOffset.width > transformLeft.value + visibleTabContentValue.value) {
        newTransform = tabOffset.right + tabOffset.width - visibleTabContentValue.value;
      }
    }
    // LTR
    else if (tabOffset.left < -transformLeft.value) {
      newTransform = -tabOffset.left;
    } else if (tabOffset.left + tabOffset.width > -transformLeft.value + visibleTabContentValue.value) {
      newTransform = -(tabOffset.left + tabOffset.width - visibleTabContentValue.value);
    }

    setTransformTop(0);
    setTransformLeft(alignInRange(newTransform));
  } else {
    // ============ Align with left & right ============
    let newTransform = transformTop.value;

    if (tabOffset.top < -transformTop.value) {
      newTransform = -tabOffset.top;
    } else if (tabOffset.top + tabOffset.height > -transformTop.value + visibleTabContentValue.value) {
      newTransform = -(tabOffset.top + tabOffset.height - visibleTabContentValue.value);
    }

    setTransformLeft(0);
    setTransformTop(alignInRange(newTransform));
  }
};

// ========================= Focus =========================
const focusKey = ref<string>();
const isMouse = ref(false);

const enabledTabs = computed(() => tabs.value.filter((tab) => !tab.disabled).map((tab) => tab.key));

const onOffset = (offset: number) => {
  const currentIndex = enabledTabs.value.indexOf(focusKey.value || activeKey);
  const len = enabledTabs.value.length;
  const nextIndex = (currentIndex + offset + len) % len;
  const newKey = enabledTabs.value[nextIndex];
  focusKey.value = newKey;
};

const handleRemoveTab = (removalTabKey: string, e: MouseEvent | KeyboardEvent) => {
  const removeIndex = enabledTabs.value.indexOf(removalTabKey);
  const removeTab = tabs.value.find((tab) => tab.key === removalTabKey);
  const removable = getRemovable(removeTab?.closable, removeTab?.closeIcon, editable, removeTab?.disabled);

  if (removable) {
    e.preventDefault();
    e.stopPropagation();
    editable.onEdit('remove', { key: removalTabKey, event: e });

    // when remove last tab, focus previous tab
    if (removeIndex === enabledTabs.value.length - 1) {
      onOffset(-1);
    } else {
      onOffset(1);
    }
  }
};

const handleMouseDown = (key: string, e: MouseEvent) => {
  isMouse.value = true;
  // Middle mouse button
  if (e.button === 1) {
    handleRemoveTab(key, e);
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  const { code } = e;

  const isRTL = rtl && tabPositionTopOrBottom.value;
  const firstEnabledTab = enabledTabs.value[0];
  const lastEnabledTab = enabledTabs.value[enabledTabs.value.length - 1];

  switch (code) {
    // LEFT
    case 'ArrowLeft': {
      if (tabPositionTopOrBottom.value) {
        onOffset(isRTL ? 1 : -1);
      }
      break;
    }

    // RIGHT
    case 'ArrowRight': {
      if (tabPositionTopOrBottom.value) {
        onOffset(isRTL ? -1 : 1);
      }
      break;
    }

    // UP
    case 'ArrowUp': {
      e.preventDefault();
      if (!tabPositionTopOrBottom.value) {
        onOffset(-1);
      }
      break;
    }

    // DOWN
    case 'ArrowDown': {
      e.preventDefault();
      if (!tabPositionTopOrBottom.value) {
        onOffset(1);
      }
      break;
    }

    // HOME
    case 'Home': {
      e.preventDefault();
      focusKey.value = firstEnabledTab;
      break;
    }

    // END
    case 'End': {
      e.preventDefault();
      focusKey.value = lastEnabledTab;
      break;
    }

    // Enter & Space
    case 'Enter':
    case 'Space': {
      e.preventDefault();
      onTabClick(focusKey.value ?? activeKey, e);
      break;
    }
    // Backspace
    case 'Backspace':
    case 'Delete': {
      handleRemoveTab(focusKey.value, e);
      break;
    }
  }
};

// ========================== Tab ==========================
const tabNodeStyle = computed(() => {
  const result: CSSProperties = {};
  if (tabPositionTopOrBottom.value) {
    result[rtl ? 'marginRight' : 'marginLeft'] = `${tabBarGutter}px`;
  } else {
    result.marginTop = `${tabBarGutter}px`;
  }
  return result;
});

const TabNodes = () => {
  return tabs.value.map((tab, i) => {
    const { key } = tab;
    return (
      <TabNode
        id={id}
        prefixCls={prefixCls.value}
        key={key}
        tab={tab}
        class={tabsClassNames?.item}
        /* first node should not have margin left */
        style={i === 0 ? styles?.item : { ...tabNodeStyle.value, ...styles?.item }}
        closable={tab.closable}
        editable={editable}
        active={key === activeKey}
        focus={key === focusKey.value}
        removeAriaLabel={locale?.removeAriaLabel}
        tabCount={enabledTabs.value.length}
        currentPosition={i + 1}
        onClick={(e) => {
          onTabClick(key, e);
        }}
        onKeydown={handleKeyDown}
        onFocus={() => {
          if (!isMouse.value) {
            focusKey.value = key;
          }
          scrollToTab(key);
          doLockAnimation();
          if (!tabsWrapperRef.value) {
            return;
          }
          // Focus element will make scrollLeft change which we should reset back
          if (!rtl) {
            tabsWrapperRef.value.scrollLeft = 0;
          }
          tabsWrapperRef.value.scrollTop = 0;
        }}
        onBlur={() => {
          focusKey.value = undefined;
        }}
        onMousedown={(e) => handleMouseDown(key, e)}
        onMouseup={() => {
          isMouse.value = false;
        }}
      />
    );
  });
};

// Update buttons records
const updateTabSizes = () =>
  setTabSizes(() => {
    const newSizes: TabSizeMap = new Map();
    const listRect = tabListRef.value?.getBoundingClientRect();

    tabs.value.forEach(({ key }) => {
      const btnNode = tabListRef.value?.querySelector<HTMLElement>(`[data-node-key="${genDataNodeKey(key)}"]`);
      if (btnNode) {
        const [width, height, left, top] = getTabSize(btnNode, listRect);
        newSizes.set(key, { width, height, left, top });
      }
    });
    return newSizes;
  });

watch(
  tabs,
  () => {
    updateTabSizes();
  },
  { immediate: true, deep: true },
);

const onListHolderResize = useUpdate(() => {
  // Update wrapper records
  const containerSize = getSize(containerRef);
  const extraLeftSize = getSize(extraLeftRef);
  const extraRightSize = getSize(extraRightRef);
  containerExcludeExtraSize.value = [
    containerSize[0] - extraLeftSize[0] - extraRightSize[0],
    containerSize[1] - extraLeftSize[1] - extraRightSize[1],
  ];

  const newAddSize = getSize(innerAddButtonRef);
  addSize.value = newAddSize;

  const newOperationSize = getSize(operationsRef);
  operationSize.value = newOperationSize;

  // Which includes add button size
  const tabContentFullSize = getSize(tabListRef);
  tabContentSize.value = [tabContentFullSize[0] - newAddSize[0], tabContentFullSize[1] - newAddSize[1]];

  // Update buttons records
  updateTabSizes();
});

// ======================== Dropdown =======================
const startHiddenTabs = computed(() => tabs.value.slice(0, visibleStart.value));
const endHiddenTabs = computed(() => tabs.value.slice(visibleEnd.value + 1));
const hiddenTabs = computed(() => [...startHiddenTabs.value, ...endHiddenTabs.value]);

// =================== Link & Operations ===================
const activeTabOffset = computed(() => tabOffsets.value.get(activeKey));
const { style: indicatorStyle } = useIndicator(
  reactiveComputed(() => ({
    activeTabOffset,
    horizontal: tabPositionTopOrBottom,
    indicator,
    rtl,
  })),
);

// ========================= Effect ========================
watch(
  [() => activeKey, transformMin, transformMax, activeTabOffset, tabOffsets, tabPositionTopOrBottom],
  () => {
    scrollToTab();
  },
  { immediate: true, deep: true },
);

// Should recalculate when rtl changed
watch(
  () => rtl,
  () => {
    onListHolderResize();
  },
  { immediate: true, deep: true },
);

// ========================= Render ========================
const hasDropdown = computed(() => !!hiddenTabs.value.length);
const wrapPrefix = computed(() => `${prefixCls.value}-nav-wrap`);
const { pingLeft, pingRight, pingBottom, pingTop } = toRefs(
  reactiveComputed(() => {
    let pingLeft: boolean;
    let pingRight: boolean;
    let pingTop: boolean;
    let pingBottom: boolean;

    if (tabPositionTopOrBottom.value) {
      if (rtl) {
        pingRight = transformLeft.value > 0;
        pingLeft = transformLeft.value !== transformMax.value;
      } else {
        pingLeft = transformLeft.value < 0;
        pingRight = transformLeft.value !== transformMin.value;
      }
    } else {
      pingTop = transformTop.value < 0;
      pingBottom = transformTop.value !== transformMin.value;
    }
    return { pingLeft, pingRight, pingTop, pingBottom };
  }),
);
</script>
<template>
  <ResizeObserver :ref="(el: any) => (containerRef = el?.el)" @resize="onListHolderResize">
    <div
      role="tablist"
      :aria-orientation="tabPositionTopOrBottom ? 'horizontal' : 'vertical'"
      :class="clsx(`${prefixCls}-nav`, className, tabsClassNames?.header)"
      :style="{ ...styles?.header, ...style }"
      @keydown="doLockAnimation"
    >
      <ExtraContent :ref="(el: any) => (extraLeftRef = el?.el)" position="left" :extra="extra" :prefix-cls="prefixCls" />
      <ResizeObserver :ref="(el: any) => (tabsWrapperRef = el?.el)" @resize="onListHolderResize">
        <div
          :class="
            clsx(wrapPrefix, {
              [`${wrapPrefix}-ping-left`]: pingLeft,
              [`${wrapPrefix}-ping-right`]: pingRight,
              [`${wrapPrefix}-ping-top`]: pingTop,
              [`${wrapPrefix}-ping-bottom`]: pingBottom,
            })
          "
        >
          <ResizeObserver :ref="(el: any) => tabListRef = el?.el" @resize="onListHolderResize">
            <div
              :class="`${prefixCls}-nav-list`"
              :style="{
                transform: `translate(${transformLeft}px, ${transformTop}px)`,
                transition: lockAnimation ? 'none' : undefined,
              }"
            >
              <TabNodes />
              <AddButton
                :ref="(el: any) => innerAddButtonRef = el?.el"
                :prefix-cls="prefixCls"
                :locale="locale"
                :editable="editable"
                :style="{ ...(TabNodes().length === 0 ? undefined : tabNodeStyle), visibility: hasDropdown ? 'hidden' : null }"
              />
              <div
                :class="
                  clsx(`${prefixCls}-ink-bar`, tabsClassNames?.indicator, {
                    [`${prefixCls}-ink-bar-animated`]: animated.inkBar,
                  })
                "
                :style="{ ...indicatorStyle, ...styles?.indicator }"
              ></div>
            </div>
          </ResizeObserver>
        </div>
      </ResizeObserver>

      <OperationNode
        v-bind="$props"
        :remove-aria-label="locale?.removeAriaLabel"
        :ref="(el: any) => (operationsRef = el?.el)"
        :prefix-cls="prefixCls"
        :tabs="hiddenTabs"
        :class="!hasDropdown && operationsHiddenClassName"
        :popup-style="styles?.popup"
        :tab-moving="!!lockAnimation"
      />
      <ExtraContent :ref="(el:any) => (extraRightRef = el?.el)" position="right" :extra="extra" :prefix-cls="prefixCls" />
    </div>
  </ResizeObserver>
</template>
