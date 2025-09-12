<script lang="tsx" setup>
import { computed, ref, useTemplateRef, watch, type CSSProperties } from 'vue';
import type { EditableConfig, MoreProps, Tab, TabsLocale } from '../interface';
import Menu, { type MenuProps } from '@/vc-component/menu';
import { getRemovable } from '../util';
import KeyCode from '@/vc-util/KeyCode';
import clsx from 'clsx';
import Dropdown from '@/vc-component/dropdown';
import { Render } from '@/components';

export interface OperationNodeProps {
  prefixCls: string;
  class?: string;
  style?: CSSProperties;
  id: any;
  tabs: Tab[];
  rtl: boolean;
  tabBarGutter?: number;
  activeKey: string | undefined;
  mobile: boolean;
  more?: MoreProps;
  editable?: EditableConfig;
  locale?: TabsLocale;
  removeAriaLabel?: string;
  onTabClick: (key: string, e: MouseEvent | KeyboardEvent) => void;
  tabMoving?: boolean;
  getPopupContainer?: (node: HTMLElement) => HTMLElement;
  popupClassName?: string;
  popupStyle?: CSSProperties;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  id,
  tabs,
  locale,
  mobile,
  more: moreProps = {},
  style,
  class: className,
  editable,
  tabBarGutter,
  rtl,
  removeAriaLabel,
  onTabClick,
  getPopupContainer,
  popupClassName,
  popupStyle,
} = defineProps<OperationNodeProps>();

// ======================== Dropdown ========================
const open = ref(false);
const selectedKey = ref<string>(null);

const moreIcon = computed(() => moreProps?.icon || 'More');

const popupId = computed(() => `${id}-more-popup`);
const dropdownPrefix = computed(() => `${prefixCls}-dropdown`);
const selectedItemId = computed(() => (selectedKey.value !== null ? `${popupId.value}-${selectedKey.value}` : null));

const dropdownAriaLabel = computed(() => locale?.dropdownAriaLabel);

function onRemoveTab(event: MouseEvent | KeyboardEvent, key: string) {
  event.preventDefault();
  event.stopPropagation();
  editable.onEdit('remove', { key, event });
}

const getItems = () => {
  return tabs.map((tab) => {
    const { closable, disabled, closeIcon, key, label } = tab;
    const removable = getRemovable(closable, closeIcon, editable, disabled);
    return {
      key,
      type: 'item',
      role: 'option',
      'aria-controls': id && `${id}-panel-${key}`,
      disabled,
      label: (
        <>
          <span>{label}</span>
          {removable && (
            <button
              type="button"
              aria-label={removeAriaLabel || 'remove'}
              tabindex={0}
              class={`${dropdownPrefix.value}-menu-item-remove`}
              onClick={(e) => {
                e.stopPropagation();
                onRemoveTab(e, key);
              }}
            >
              {closeIcon || editable.removeIcon || '×'}
            </button>
          )}
        </>
      ),
    };
  }) as MenuProps['items'];
};

const menu = () => (
  <Menu
    onClick={({ key, domEvent }) => {
      onTabClick(key, domEvent);
      open.value = false;
    }}
    prefixCls={`${dropdownPrefix.value}-menu`}
    id={popupId.value}
    tabindex={-1}
    role="listbox"
    aria-activedescendant={selectedItemId.value}
    selectedKeys={[selectedKey.value]}
    aria-label={dropdownAriaLabel.value !== undefined ? dropdownAriaLabel.value : 'expanded dropdown'}
    items={getItems()}
  ></Menu>
);

function selectOffset(offset: -1 | 1) {
  const enabledTabs = tabs.filter((tab) => !tab.disabled);
  let selectedIndex = enabledTabs.findIndex((tab) => tab.key === selectedKey.value) || 0;
  const len = enabledTabs.length;

  for (let i = 0; i < len; i += 1) {
    selectedIndex = (selectedIndex + offset + len) % len;
    const tab = enabledTabs[selectedIndex];
    if (!tab.disabled) {
      selectedKey.value = tab.key;
      return;
    }
  }
}

function onKeyDown(e: KeyboardEvent) {
  const { which } = e;

  if (!open.value) {
    if ([KeyCode.DOWN, KeyCode.SPACE, KeyCode.ENTER].includes(which)) {
      open.value = true;
      e.preventDefault();
    }
    return;
  }

  switch (which) {
    case KeyCode.UP:
      selectOffset(-1);
      e.preventDefault();
      break;
    case KeyCode.DOWN:
      selectOffset(1);
      e.preventDefault();
      break;
    case KeyCode.ESC:
      open.value = false;
      break;
    case KeyCode.SPACE:
    case KeyCode.ENTER:
      if (selectedKey.value !== null) {
        onTabClick(selectedKey.value, e);
      }
      break;
  }
}

// ========================= Effect =========================
watch(
  selectedKey,
  () => {
    // We use query element here to avoid React strict warning
    const ele = document.getElementById(selectedItemId.value);
    if (ele && ele.scrollIntoView) {
      ele.scrollIntoView(false);
    }
  },
  { immediate: true },
);

watch(
  open,
  () => {
    if (!open.value) {
      selectedKey.value = null;
    }
  },
  { immediate: true },
);

// ========================= Render =========================
const moreStyle = computed(() => {
  const result: CSSProperties = {
    [rtl ? 'marginRight' : 'marginLeft']: `${tabBarGutter}px`,
  };
  if (!tabs.length) {
    result.visibility = 'hidden';
    result.order = 1;
  }
  return result;
});

const overlayClassName = computed(() =>
  clsx(popupClassName, {
    [`${dropdownPrefix.value}-rtl`]: rtl,
  }),
);
const domRef = useTemplateRef('domRef');

defineExpose({
  get el() {
    return domRef.value;
  },
});
</script>
<template>
  <div :class="clsx(`${prefixCls}-nav-operations`, className)" :style="style" ref="domRef">
    <Dropdown
      v-if="!mobile"
      :prefix-cls="dropdownPrefix"
      :overlay="menu"
      :visible="tabs.length ? open : false"
      @visible-change="(e) => (open = e)"
      :overlay-class-name="overlayClassName"
      :overlay-style="popupStyle"
      :mouse-enter-delay="0.1"
      :mouse-leave-delay="0.1"
      :get-popup-container="getPopupContainer"
      v-bind="moreProps"
    >
      <template #default="props">
        <button
          type="button"
          :class="`${prefixCls}-nav-more`"
          :style="moreStyle"
          aria-haspopup="listbox"
          :aria-controls="popupId"
          :id="`${id}-more`"
          :aria-expanded="open"
          @keydown="onKeyDown"
          v-bind="props"
        >
          <Render :content="moreIcon" />
        </button>
      </template>
    </Dropdown>
  </div>
</template>
