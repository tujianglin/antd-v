<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, ref, toRefs, watch } from 'vue';
import { FIX_LABEL } from '.';
import type { DefaultOptionType, SingleValueType } from '../Cascader.vue';
import { useCascaderContextInject } from '../context';
import { SEARCH_MARK } from '../hooks/useSearchOptions';
import { isLeaf, toPathKey } from '../utils/commonUtil';
import pickAttrs from '@/vc-util/pickAttrs';
import Checkbox from './Checkbox.vue';
import { Render } from '@/components';
export interface ColumnProps<OptionType extends DefaultOptionType = DefaultOptionType> {
  prefixCls: string;
  multiple?: boolean;
  options: OptionType[];
  /** Current Column opened item key */
  activeValue?: PropertyKey;
  /** The value path before current column */
  prevValuePath: PropertyKey[];
  onToggleOpen: (open: boolean) => void;
  onSelect: (valuePath: SingleValueType, leaf: boolean) => void;
  onActive: (valuePath: SingleValueType) => void;
  checkedSet: Set<PropertyKey>;
  halfCheckedSet: Set<PropertyKey>;
  loadingKeys: PropertyKey[];
  isSelectable: (option: DefaultOptionType) => boolean;
  disabled?: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  multiple,
  options,
  activeValue,
  prevValuePath,
  onToggleOpen,
  onSelect,
  onActive,
  checkedSet,
  halfCheckedSet,
  loadingKeys,
  isSelectable,
  disabled: propsDisabled,
} = defineProps<ColumnProps>();

const menuPrefixCls = computed(() => `${prefixCls}-menu`);
const menuItemPrefixCls = computed(() => `${prefixCls}-menu-item`);
const menuRef = ref<HTMLUListElement>(null);

const {
  fieldNames,
  changeOnSelect,
  expandTrigger,
  expandIcon,
  loadingIcon,
  popupMenuColumnStyle,
  optionRender,
  classNames,
  styles,
} = toRefs(useCascaderContextInject());

const hoverOpen = computed(() => expandTrigger.value === 'hover');

const isOptionDisabled = (disabled?: boolean) => propsDisabled || disabled;

// ============================ Option ============================
const optionInfoList = computed(() =>
  options.map((option) => {
    const { disabled, disableCheckbox } = option;
    const searchOptions: Record<string, any>[] = option[SEARCH_MARK];
    const label = option[FIX_LABEL] ?? option[fieldNames.value.label];
    const value = option[fieldNames.value.value];

    const isMergedLeaf = isLeaf(option, fieldNames.value);

    // Get real value of option. Search option is different way.
    const fullPath = searchOptions ? searchOptions.map((opt) => opt[fieldNames.value.value]) : [...prevValuePath, value];
    const fullPathKey = toPathKey(fullPath);

    const isLoading = loadingKeys.includes(fullPathKey);

    // >>>>> checked
    const checked = checkedSet.has(fullPathKey);

    // >>>>> halfChecked
    const halfChecked = halfCheckedSet.has(fullPathKey);

    return {
      disabled,
      label,
      value,
      isLeaf: isMergedLeaf,
      isLoading,
      checked,
      halfChecked,
      option,
      disableCheckbox,
      fullPath,
      fullPathKey,
    };
  }),
);

watch(
  [() => activeValue, menuItemPrefixCls],
  () => {
    if (menuRef.value) {
      const selector = `.${menuItemPrefixCls.value}-active`;
      const activeElement = menuRef.value.querySelector<HTMLElement>(selector);

      if (activeElement) {
        activeElement.scrollIntoView({
          block: 'nearest',
          inline: 'nearest',
        });
      }
    }
  },
  { immediate: true, deep: true },
);

const ItemNode = (props) => {
  const {
    disabled,
    label,
    value,
    isLeaf: isMergedLeaf,
    isLoading,
    checked,
    halfChecked,
    option,
    fullPath,
    fullPathKey,
    disableCheckbox,
  } = props;
  const ariaProps = pickAttrs(option, {
    aria: true,
    data: true,
  });
  // >>>>> Open
  const triggerOpenPath = () => {
    if (isOptionDisabled(disabled)) {
      return;
    }
    const nextValueCells = [...fullPath];
    if (hoverOpen.value && isMergedLeaf) {
      nextValueCells.pop();
    }
    onActive(nextValueCells);
  };

  // >>>>> Selection
  const triggerSelect = () => {
    if (isSelectable(option) && !isOptionDisabled(disabled)) {
      onSelect(fullPath, isMergedLeaf);
    }
  };

  // >>>>> Title
  let title: string | undefined;
  if (typeof option.title === 'string') {
    title = option.title;
  } else if (typeof label === 'string') {
    title = label;
  }
  return (
    <li
      {...ariaProps}
      class={clsx(menuItemPrefixCls.value, classNames?.value?.popup?.listItem, {
        [`${menuItemPrefixCls.value}-expand`]: !isMergedLeaf,
        [`${menuItemPrefixCls.value}-active`]: activeValue === value || activeValue === fullPathKey,
        [`${menuItemPrefixCls.value}-disabled`]: isOptionDisabled(disabled),
        [`${menuItemPrefixCls.value}-loading`]: isLoading,
      })}
      style={{ ...popupMenuColumnStyle.value, ...styles?.value?.popup?.listItem }}
      role="menuitemcheckbox"
      title={title}
      aria-checked={checked}
      data-path-key={fullPathKey}
      onClick={() => {
        triggerOpenPath();
        if (disableCheckbox) {
          return;
        }
        if (!multiple || isMergedLeaf) {
          triggerSelect();
        }
      }}
      onDblclick={() => {
        if (changeOnSelect.value) {
          onToggleOpen(false);
        }
      }}
      onMouseenter={() => {
        if (hoverOpen.value) {
          triggerOpenPath();
        }
      }}
      onMousedown={(e) => {
        // Prevent selector from blurring
        e.preventDefault();
      }}
    >
      {multiple && (
        <Checkbox
          prefixCls={`${prefixCls}-checkbox`}
          checked={checked}
          halfChecked={halfChecked}
          disabled={isOptionDisabled(disabled) || disableCheckbox}
          disableCheckbox={disableCheckbox}
          onClick={(e: MouseEvent) => {
            if (disableCheckbox) {
              return;
            }
            e.stopPropagation();
            triggerSelect();
          }}
        />
      )}
      <div class={`${menuItemPrefixCls.value}-content`}>
        <Render content={optionRender?.value ? optionRender?.value(option) : label}></Render>
      </div>
      {!isLoading && expandIcon.value && !isMergedLeaf && (
        <div class={`${menuItemPrefixCls.value}-expand-icon`}>
          <Render content={expandIcon.value}></Render>
        </div>
      )}
      {isLoading && loadingIcon.value && (
        <div class={`${menuItemPrefixCls.value}-loading-icon`}>
          <Render content={loadingIcon.value}></Render>
        </div>
      )}
    </li>
  );
};
</script>
<template>
  <ul :class="clsx(menuPrefixCls, classNames?.popup?.list)" :style="styles?.popup?.list" ref="menuRef" role="menu">
    <template v-for="item in optionInfoList" :key="item.fullPathKey">
      <component :is="ItemNode(item)" />
    </template>
  </ul>
</template>
