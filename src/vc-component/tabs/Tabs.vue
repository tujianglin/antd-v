<script lang="tsx" setup>
import isMobile from '@/vc-util/isMobile';
import clsx from 'clsx';
import { computed, onMounted, ref, useTemplateRef, watch, type CSSProperties } from 'vue';
import useAnimateConfig from './hooks/useAnimateConfig';
import type { GetIndicatorSize } from './hooks/useIndicator';
import type {
  AnimatedConfig,
  EditableConfig,
  MoreProps,
  OnTabScroll,
  RenderTabBar,
  Tab,
  TabBarExtraContent,
  TabPosition,
  TabsLocale,
} from './interface';
import { TabContextProvider } from './TabContext';
import TabNavListWrapper from './TabNavList/Wrapper.vue';
import TabPanelList from './TabPanelList/index.vue';

/**
 * Should added antd:
 * - type
 *
 * Removed:
 * - onNextClick
 * - onPrevClick
 * - keyboard
 */

// Used for accessibility

export type SemanticName = 'popup' | 'item' | 'indicator' | 'content' | 'header';
//  /** extends @vue-ignore */ Omit<HTMLAttributes, 'onChange'>
export interface TabsProps {
  prefixCls?: string;
  class?: string;
  style?: CSSProperties;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  id?: string;

  items?: Tab[];

  direction?: 'ltr' | 'rtl';
  animated?: boolean | AnimatedConfig;
  renderTabBar?: RenderTabBar;
  tabBarExtraContent?: TabBarExtraContent;
  tabBarGutter?: number;
  tabBarStyle?: CSSProperties;
  tabPosition?: TabPosition;
  destroyOnHidden?: boolean;

  onChange?: (activeKey: string) => void;
  onTabClick?: (activeKey: string, e: KeyboardEvent | MouseEvent) => void;
  onTabScroll?: OnTabScroll;

  editable?: EditableConfig;
  getPopupContainer?: (node: HTMLElement) => HTMLElement;

  // Accessibility
  locale?: TabsLocale;

  // Icons
  more?: MoreProps;
  /** @private Internal usage. Not promise will rename in future */
  popupClassName?: string;
  indicator?: {
    size?: GetIndicatorSize;
    align?: 'start' | 'center' | 'end';
  };
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  id,
  prefixCls = 'rc-tabs',
  class: className,
  items,
  direction,
  editable,
  animated = true,
  tabPosition = 'top',
  tabBarGutter,
  tabBarStyle,
  tabBarExtraContent,
  locale,
  more,
  destroyOnHidden,
  renderTabBar,
  onChange,
  onTabClick,
  onTabScroll,
  getPopupContainer,
  popupClassName,
  indicator,
  classNames: tabsClassNames,
  styles,
  ...restProps
} = defineProps<TabsProps>();

let uuid = 0;

const tabs = computed<Tab[]>(() => (items || []).filter((item) => item && typeof item === 'object' && 'key' in item));
const rtl = computed(() => direction === 'rtl');

const mergedAnimated = computed(() => useAnimateConfig(animated));

// ======================== Mobile ========================
const mobile = ref(false);
onMounted(() => {
  // Only update on the client side
  mobile.value = isMobile();
});

// ====================== Active Key ======================
const mergedActiveKey = defineModel<string | undefined>('activeKey');
mergedActiveKey.value = mergedActiveKey.value || tabs?.value?.[0]?.key;
const activeIndex = ref<number>(0);
activeIndex.value = tabs.value.findIndex((tab) => tab.key === mergedActiveKey.value);

// Reset active key if not exist anymore
watch(
  [tabs, mergedActiveKey, activeIndex],
  () => {
    let newActiveIndex = tabs.value.findIndex((tab) => tab.key === mergedActiveKey.value);
    if (newActiveIndex === -1) {
      newActiveIndex = Math.max(0, Math.min(activeIndex.value, tabs.value.length - 1));
      mergedActiveKey.value = tabs.value[newActiveIndex]?.key;
    }
    activeIndex.value = newActiveIndex;
  },
  { immediate: true, deep: true },
);

// ===================== Accessibility ====================
const mergedId = ref(id);

// Async generate id to avoid ssr mapping failed
onMounted(() => {
  if (!id) {
    mergedId.value = `rc-tabs-${process.env.NODE_ENV === 'test' ? 'test' : uuid}`;
    uuid += 1;
  }
});

// ======================== Events ========================
function onInternalTabClick(key: string, e: MouseEvent | KeyboardEvent) {
  onTabClick?.(key, e);
  const isActiveChanged = key !== mergedActiveKey.value;
  mergedActiveKey.value = key;
  if (isActiveChanged) {
    onChange?.(key);
  }
}

// ======================== Render ========================
const sharedProps = computed(() => {
  return {
    id: mergedId.value,
    activeKey: mergedActiveKey.value,
    animated: mergedAnimated.value,
    tabPosition,
    rtl: rtl.value,
    mobile: mobile.value,
  };
});

const tabNavBarProps = computed(() => ({
  ...sharedProps.value,
  editable,
  locale,
  more,
  tabBarGutter,
  onTabClick: onInternalTabClick,
  onTabScroll,
  extra: tabBarExtraContent,
  style: tabBarStyle,
  getPopupContainer,
  popupClassName: clsx(popupClassName, tabsClassNames?.popup),
  indicator,
  styles,
  classNames: tabsClassNames,
}));

const domRef = useTemplateRef('domRef');

defineExpose({
  get el() {
    return domRef.value;
  },
});
</script>
<template>
  <TabContextProvider :value="{ tabs, prefixCls }">
    <div
      ref="domRef"
      :id="id"
      :class="
        clsx(
          prefixCls,
          `${prefixCls}-${tabPosition}`,
          {
            [`${prefixCls}-mobile`]: mobile,
            [`${prefixCls}-editable`]: editable,
            [`${prefixCls}-rtl`]: rtl,
          },
          className,
        )
      "
      v-bind="restProps"
    >
      <TabNavListWrapper v-bind="tabNavBarProps" :render-tab-bar="renderTabBar" />
      <TabPanelList
        :destroy-on-hidden="destroyOnHidden"
        v-bind="sharedProps"
        :content-style="styles?.content"
        :content-class-name="tabsClassNames?.content"
        :animated="mergedAnimated"
      />
    </div>
  </TabContextProvider>
</template>
