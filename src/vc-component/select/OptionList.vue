<script lang="tsx" setup>
import type { ListRef, ScrollConfig } from '@/vc-component/virtual-list/interface';
import KeyCode from '@/vc-util/KeyCode';
import { computed, onBeforeUnmount, ref, toRefs, watch, withModifiers } from 'vue';
import { useBaseSelectContextInject } from './hooks/useBaseProps';
import type { BaseOptionType, FlattenOptionData, RawValueType } from './interface';
import { useSelectContextInject } from './SelectContext';
import { isPlatformMac } from './utils/platformUtil';
import { isValidCount } from './utils/valueUtil';
import pickAttrs from '@/vc-util/pickAttrs';
import List from '@/vc-component/virtual-list/List.vue';
import clsx from 'clsx';
import { omit } from 'lodash-es';
import TransBtn from './TransBtn.vue';
import Render from '@/vc-component/render';
import { isValidElement, isValidNode } from '@/vc-util/Children/util';

// export interface OptionListProps<OptionsType extends object[]> {
export type OptionListProps = Record<string, never>;

export interface RefOptionListProps {
  onKeydown: (e: KeyboardEvent) => void;
  onKeyup: (e: KeyboardEvent) => void;
  scrollTo?: (args: number | ScrollConfig) => void;
}

function isTitleType(content: any) {
  return typeof content === 'string' || typeof content === 'number';
}

const { prefixCls, id, open, multiple, mode, searchValue, toggleOpen, notFoundContent, onPopupScroll, showScrollBar } =
  toRefs(useBaseSelectContextInject());

const {
  maxCount,
  flattenOptions,
  onActiveValue,
  defaultActiveFirstOption,
  onSelect,
  menuItemSelectedIcon,
  rawValues,
  fieldNames,
  virtual,
  direction,
  listHeight,
  listItemHeight,
  optionRender,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useSelectContextInject());

const itemPrefixCls = `${prefixCls.value}-item`;

const memoFlattenOptions = ref(flattenOptions.value);

watch(
  [open, flattenOptions],
  (next, prev) => {
    if (next[0] && prev[1] !== next[1]) {
      memoFlattenOptions.value = next[1]; // 更新
    }
  },
  { immediate: true },
);

// =========================== List ===========================
const listRef = ref<ListRef>(null);

const overMaxCount = computed(
  (): boolean => multiple.value && isValidCount(maxCount.value) && rawValues.value?.size >= maxCount.value,
);

const onListMouseDown = (event) => {
  event.preventDefault();
};

const scrollIntoView = (args: number | ScrollConfig) => {
  listRef.value?.scrollTo(typeof args === 'number' ? { index: args } : args);
};

// https://github.com/ant-design/ant-design/issues/34975
const isSelected = (value: RawValueType) => {
  if (mode.value === 'combobox') {
    return false;
  }
  return rawValues.value.has(value);
};

// ========================== Active ==========================
const getEnabledActiveIndex = (index: number, offset: number = 1): number => {
  const len = memoFlattenOptions.value.length;

  for (let i = 0; i < len; i += 1) {
    const current = (index + i * offset + len) % len;

    // @ts-ignore 111
    const { group, data } = memoFlattenOptions.value[current] || {};

    if (!group && !data?.disabled && (isSelected(data.value) || !overMaxCount.value)) {
      return current;
    }
  }

  return -1;
};

const activeIndex = ref(getEnabledActiveIndex(0));
const setActive = (index: number, fromKeyboard = false) => {
  activeIndex.value = index;

  const info = { source: fromKeyboard ? ('keyboard' as const) : ('mouse' as const) };

  // Trigger active event
  const flattenItem = memoFlattenOptions[index];
  if (!flattenItem) {
    onActiveValue.value(null, -1, info);
    return;
  }
  onActiveValue.value(flattenItem.value, index, info);
};

// Auto active first item when list length or searchValue changed
watch(
  [() => memoFlattenOptions.value.length, () => searchValue.value],
  () => {
    setActive(defaultActiveFirstOption.value !== false ? getEnabledActiveIndex(0) : -1);
  },
  { immediate: true },
);

// https://github.com/ant-design/ant-design/issues/48036
const isAriaSelected = (value: RawValueType) => {
  if (mode.value === 'combobox') {
    return String(value).toLowerCase() === searchValue.value.toLowerCase();
  }
  return rawValues.value.has(value);
};

let timeoutId: NodeJS.Timeout;
// Auto scroll to item position in single mode
watch(
  [() => open.value, () => searchValue.value],
  () => {
    /**
     * React will skip `onChange` when component update.
     * `setActive` function will call root accessibility state update which makes re-render.
     * So we need to delay to let Input component trigger onChange first.
     */

    if (!multiple.value && open.value && rawValues.value.size === 1) {
      const value: RawValueType = Array.from(rawValues.value)[0];
      // Scroll to the option closest to the searchValue if searching.
      const index = memoFlattenOptions.value.findIndex(({ data }) =>
        searchValue.value ? String(data.value).startsWith(searchValue.value) : data.value === value,
      );

      if (index !== -1) {
        setActive(index);
        timeoutId = setTimeout(() => {
          scrollIntoView(index);
        });
      }
    }

    // Force trigger scrollbar visible when open
    if (open.value) {
      listRef.value?.scrollTo(undefined);
    }
  },
  { immediate: true, flush: 'post' },
);

onBeforeUnmount(() => {
  clearTimeout(timeoutId);
});

// ========================== Values ==========================
const onSelectValue = (value: RawValueType) => {
  if (value !== undefined) {
    onSelect.value(value, { selected: !rawValues.value.has(value) });
  }

  // Single mode should always close by select
  if (!multiple.value) {
    setTimeout(() => {
      toggleOpen.value(false);
    });
  }
};

defineExpose({
  onKeydown: (event) => {
    const { which, ctrlKey } = event;
    switch (which) {
      // >>> Arrow keys & ctrl + n/p on Mac
      case KeyCode.N:
      case KeyCode.P:
      case KeyCode.UP:
      case KeyCode.DOWN: {
        let offset = 0;
        if (which === KeyCode.UP) {
          offset = -1;
        } else if (which === KeyCode.DOWN) {
          offset = 1;
        } else if (isPlatformMac() && ctrlKey) {
          if (which === KeyCode.N) {
            offset = 1;
          } else if (which === KeyCode.P) {
            offset = -1;
          }
        }

        if (offset !== 0) {
          const nextActiveIndex = getEnabledActiveIndex(activeIndex.value + offset, offset);
          scrollIntoView(nextActiveIndex);
          setActive(nextActiveIndex, true);
        }

        break;
      }

      // >>> Select (Tab / Enter)
      case KeyCode.TAB:
      case KeyCode.ENTER: {
        // value
        const item = memoFlattenOptions.value[activeIndex.value];
        if (!item || item.data.disabled) {
          return onSelectValue(undefined);
        }

        if (!overMaxCount.value || rawValues.value.has(item.value)) {
          onSelectValue(item.value);
        } else {
          onSelectValue(undefined);
        }

        if (open.value) {
          event.preventDefault();
        }

        break;
      }

      // >>> Close
      case KeyCode.ESC: {
        toggleOpen.value(false);
        if (open.value) {
          event.stopPropagation();
        }
      }
    }
  },
  onKeyup: () => {},

  scrollTo: (index) => {
    scrollIntoView(index);
  },
});

const omitFieldNameList = computed(() => Object.keys(fieldNames.value).map((key) => fieldNames.value[key]));

const getLabel = (item: Record<string, any>) => (typeof item.label === 'function' ? item.label() : item.label);

function getItemAriaProps(item: FlattenOptionData<BaseOptionType>, index: number) {
  const { group } = item;

  return {
    role: group ? 'presentation' : 'option',
    id: `${id.value}_list_${index}`,
  };
}

const renderItem = (index: number) => {
  const item = memoFlattenOptions.value[index];
  if (!item) {
    return null;
  }
  const itemData = item.data || {};
  const { value } = itemData;
  const { group } = item;
  const attrs = pickAttrs(itemData, true);
  const mergedLabel = getLabel(item);
  return item ? (
    <div
      aria-label={typeof mergedLabel === 'string' && !group ? mergedLabel : null}
      {...attrs}
      key={index}
      {...getItemAriaProps(item, index)}
      aria-selected={isAriaSelected(value)}
    >
      {value}
    </div>
  ) : null;
};

const a11yProps = computed(() => ({
  role: 'listbox',
  id: `${id.value}_list`,
}));

const ListNode = () => {
  return (
    <List
      itemKey="key"
      ref={listRef}
      data={memoFlattenOptions.value}
      height={listHeight.value}
      itemHeight={listItemHeight.value}
      fullHeight={false}
      onMousedown={onListMouseDown}
      onScroll={onPopupScroll.value}
      virtual={virtual.value}
      direction={direction.value}
      innerProps={virtual.value ? null : a11yProps.value}
      showScrollBar={showScrollBar.value}
      class={contextClassNames.value?.popup?.list}
      style={contextStyles.value?.popup?.list}
    >
      {({ item, index: itemIndex }) => {
        const { group, groupOption, data, label, value } = item;
        const { key } = data;

        // Group
        if (group) {
          const groupTitle = data.title ?? (isTitleType(label) ? label.toString() : undefined);

          return (
            <div class={clsx(itemPrefixCls, `${itemPrefixCls}-group`, data.className)} title={groupTitle}>
              {label !== undefined ? label : key}
            </div>
          );
        }
        const { disabled, title, style, className, ...otherProps } = data;
        const passedProps = omit(otherProps, omitFieldNameList.value);
        // Option
        const selected = isSelected(value);

        const mergedDisabled = disabled || (!selected && overMaxCount.value);

        const optionPrefixCls = `${itemPrefixCls}-option`;
        const optionClassName = clsx(itemPrefixCls, optionPrefixCls, className, contextClassNames.value?.popup?.listItem, {
          [`${optionPrefixCls}-grouped`]: groupOption,
          [`${optionPrefixCls}-active`]: activeIndex.value === itemIndex && !mergedDisabled,
          [`${optionPrefixCls}-disabled`]: mergedDisabled,
          [`${optionPrefixCls}-selected`]: selected,
        });

        const mergedLabel = getLabel(item);

        const iconVisible = !menuItemSelectedIcon.value || typeof menuItemSelectedIcon.value === 'function' || selected;
        // https://github.com/ant-design/ant-design/issues/34145
        const content = typeof mergedLabel === 'number' ? mergedLabel : mergedLabel || value;
        // https://github.com/ant-design/ant-design/issues/26717
        let optionTitle = isTitleType(content) ? content.toString() : undefined;
        if (isValidNode(content)) {
          optionTitle = content[0].children;
        }
        if (title) {
          optionTitle = title;
        }
        return (
          <div
            {...pickAttrs(passedProps)}
            {...(!virtual.value ? getItemAriaProps(item, itemIndex) : {})}
            aria-selected={virtual.value ? undefined : isAriaSelected(value)}
            class={optionClassName}
            title={optionTitle}
            onMousemove={() => {
              if (activeIndex.value === itemIndex || mergedDisabled) {
                return;
              }
              setActive(itemIndex);
            }}
            onMousedown={withModifiers(() => {
              if (!mergedDisabled) {
                onSelectValue(value);
              }
            }, ['stop'])}
            style={{ ...contextStyles.value?.popup?.listItem, ...style }}
          >
            <div class={`${optionPrefixCls}-content`}>
              {typeof optionRender.value === 'function' ? optionRender.value(item, { index: itemIndex }) : content}
            </div>
            {isValidElement(menuItemSelectedIcon.value) || selected}
            {iconVisible && (
              <TransBtn
                class={`${itemPrefixCls}-option-state`}
                customizeIcon={menuItemSelectedIcon.value}
                customizeIconProps={{
                  value,
                  disabled: mergedDisabled,
                  isSelected: selected,
                }}
              >
                {selected ? '✓' : null}
              </TransBtn>
            )}
          </div>
        );
      }}
    </List>
  );
};
</script>
<template>
  <div
    v-if="memoFlattenOptions.length === 0"
    role="listbox"
    :id="`${id}_list`"
    :class="`${itemPrefixCls}-empty`"
    @mousedown="onListMouseDown"
  >
    <Render :content="notFoundContent" />
  </div>
  <template v-else>
    <div v-if="virtual" v-bind="a11yProps" :style="{ height: 0, width: 0, overflow: 'hidden' }">
      <Render :content="renderItem(activeIndex - 1)" />
      <Render :content="renderItem(activeIndex)" />
      <Render :content="renderItem(activeIndex + 1)" />
    </div>
    <ListNode />
  </template>
</template>
