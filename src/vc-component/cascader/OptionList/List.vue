<script lang="tsx" setup>
import type { BaseSelectContextProps } from '@/vc-component/select/hooks/useBaseProps';
import { computed, getCurrentInstance, ref, toRefs, watch } from 'vue';
import { FIX_LABEL } from '.';
import type { DefaultOptionType, LegacyKey, SingleValueType } from '../Cascader.vue';
import { useCascaderContextInject } from '../context';
import { getFullPathKeys, isLeaf, scrollIntoParentView, toPathKey, toPathKeys, toPathValueStr } from '../utils/commonUtil';
import { toPathOptions } from '../utils/treeUtil';
import useActive from './useActive';
import useKeyboard from './useKeyboard';
import Column from './Column.vue';
import clsx from 'clsx';
import Render from '@/vc-component/render';
import KeyCode from '@/vc-util/KeyCode';
import { SEARCH_MARK } from '../hooks/useSearchOptions';

export type RawOptionListProps = Pick<
  BaseSelectContextProps,
  'prefixCls' | 'multiple' | 'searchValue' | 'toggleOpen' | 'notFoundContent' | 'direction' | 'open' | 'disabled'
>;

defineOptions({ name: 'RawOptionList', inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, multiple, searchValue, toggleOpen, notFoundContent, direction, open, disabled } =
  defineProps<RawOptionListProps>();

const containerRef = ref<HTMLDivElement>(null);
const rtl = computed(() => direction === 'rtl');

const {
  options,
  values,
  halfValues,
  fieldNames,
  changeOnSelect,
  onSelect,
  searchOptions,
  popupPrefixCls,
  loadData,
  expandTrigger,
} = toRefs(useCascaderContextInject());

const mergedPrefixCls = computed(() => popupPrefixCls.value || prefixCls);

// ========================= loadData =========================
const loadingKeys = ref<LegacyKey[]>([]);

const internalLoadData = (valueCells: LegacyKey[]) => {
  // Do not load when search
  if (!loadData.value || searchValue) {
    return;
  }

  const optionList = toPathOptions(valueCells, options.value, fieldNames.value);
  const rawOptions = optionList.map(({ option }) => option);
  const lastOption = rawOptions[rawOptions.length - 1];

  if (lastOption && !isLeaf(lastOption, fieldNames.value)) {
    const pathKey = toPathKey(valueCells);

    loadingKeys.value = [...loadingKeys.value, pathKey];

    loadData.value?.(rawOptions);
  }
};

// zombieJ: This is bad. We should make this same as `rc-tree` to use Promise instead.
watch(
  [options, loadingKeys, fieldNames],
  () => {
    if (loadingKeys.value.length) {
      loadingKeys.value.forEach((loadingKey) => {
        const valueStrCells = toPathValueStr(loadingKey as string);
        const optionList = toPathOptions(valueStrCells, options.value, fieldNames.value, true).map(({ option }) => option);
        const lastOption = optionList[optionList.length - 1];

        if (!lastOption || lastOption[fieldNames.value.children] || isLeaf(lastOption, fieldNames.value)) {
          loadingKeys.value = loadingKeys.value.filter((key) => key !== loadingKey);
        }
      });
    }
  },
  { immediate: true, deep: true },
);

// ========================== Values ==========================
const checkedSet = computed(() => new Set(toPathKeys(values.value)));
const halfCheckedSet = computed(() => new Set(toPathKeys(halfValues.value)));

// ====================== Accessibility =======================
const activeValueCells = useActive(
  computed(() => multiple),
  computed(() => open),
);

// =========================== Path ===========================
const onPathOpen = (nextValueCells: LegacyKey[]) => {
  activeValueCells.value = nextValueCells;

  // Trigger loadData
  internalLoadData(nextValueCells);
};

const isSelectable = (option: DefaultOptionType) => {
  if (disabled) {
    return false;
  }

  const { disabled: optionDisabled } = option;
  const isMergedLeaf = isLeaf(option, fieldNames.value);

  return !optionDisabled && (isMergedLeaf || changeOnSelect.value || multiple);
};

const onPathSelect = (valuePath: SingleValueType, leaf: boolean, fromKeyboard = false) => {
  onSelect.value?.(valuePath);

  if (!multiple && (leaf || (changeOnSelect.value && (expandTrigger.value === 'hover' || fromKeyboard)))) {
    toggleOpen(false);
  }
};

// ========================== Option ==========================
const mergedOptions = computed(() => {
  if (searchValue) {
    return searchOptions.value;
  }

  return options.value;
});

// ========================== Column ==========================
const optionColumns = computed(() => {
  const optionList = [{ options: mergedOptions.value }];
  let currentList = mergedOptions.value;

  const fullPathKeys = getFullPathKeys(currentList, fieldNames.value);

  for (let i = 0; i < activeValueCells.value.length; i += 1) {
    const activeValueCell = activeValueCells.value[i];
    const currentOption = currentList.find(
      (option, index) =>
        (fullPathKeys[index] ? toPathKey(fullPathKeys[index]) : option[fieldNames.value.value]) === activeValueCell,
    );

    const subOptions = currentOption?.[fieldNames.value.children];
    if (!subOptions?.length) {
      break;
    }

    currentList = subOptions;
    optionList.push({ options: subOptions });
  }

  return optionList;
});

// ========================= Keyboard =========================
const onKeyboardSelect = (selectValueCells: SingleValueType, option: DefaultOptionType) => {
  if (isSelectable(option)) {
    onPathSelect(selectValueCells, isLeaf(option, fieldNames.value), true);
  }
};

const { offsetActiveOption, nextColumn, prevColumn, validActiveValueCells, lastActiveIndex, lastActiveOptions } = useKeyboard(
  mergedOptions,
  fieldNames,
  activeValueCells,
  onPathOpen,
  toggleOpen,
);

// >>>>> Active Scroll
watch(
  [activeValueCells, () => searchValue],
  () => {
    if (searchValue) {
      return;
    }
    for (let i = 0; i < activeValueCells.value.length; i += 1) {
      const cellPath = activeValueCells.value.slice(0, i + 1);
      const cellKeyPath = toPathKey(cellPath);
      const ele = containerRef.value?.querySelector<HTMLElement>(
        `li[data-path-key="${cellKeyPath.replace(/\\{0,2}"/g, '\\"')}"]`, // matches unescaped double quotes
      );
      if (ele) {
        scrollIntoParentView(ele);
      }
    }
  },
  { immediate: true, deep: true },
);

// ========================== Render ==========================
// >>>>> Empty
const isEmpty = computed(() => !optionColumns.value[0]?.options?.length);

const emptyList = computed<DefaultOptionType[]>(() => [
  {
    [fieldNames.value.value as 'value']: '__EMPTY__',
    [FIX_LABEL as 'label']: notFoundContent,
    disabled: true,
  },
]);

const vm = getCurrentInstance();

const columnProps = computed(() => ({
  ...vm.props,
  multiple: !isEmpty.value && multiple,
  onSelect: onPathSelect,
  onActive: onPathOpen,
  onToggleOpen: toggleOpen,
  checkedSet: checkedSet.value,
  halfCheckedSet: halfCheckedSet.value,
  loadingKeys: loadingKeys.value,
  isSelectable,
}));

// >>>>> Columns
const mergedOptionColumns = computed(() => (isEmpty.value ? [{ options: emptyList.value }] : optionColumns.value));

const columnNodes = () => {
  return mergedOptionColumns.value.map((col, index) => {
    const prevValuePath = activeValueCells.value.slice(0, index);
    const activeValue = activeValueCells.value[index];
    return (
      <Column
        key={index}
        {...columnProps.value}
        prefixCls={mergedPrefixCls.value}
        options={col.options}
        prevValuePath={prevValuePath}
        activeValue={activeValue}
      />
    );
  });
};

defineExpose({
  // scrollTo: treeRef.current?.scrollTo,
  onKeydown: (event) => {
    const { which } = event;

    switch (which) {
      // >>> Arrow keys
      case KeyCode.UP:
      case KeyCode.DOWN: {
        let offset = 0;
        if (which === KeyCode.UP) {
          offset = -1;
        } else if (which === KeyCode.DOWN) {
          offset = 1;
        }

        if (offset !== 0) {
          offsetActiveOption(offset);
        }

        break;
      }

      case KeyCode.LEFT: {
        if (searchValue) {
          break;
        }
        if (rtl.value) {
          nextColumn();
        } else {
          prevColumn();
        }
        break;
      }

      case KeyCode.RIGHT: {
        if (searchValue) {
          break;
        }
        if (rtl.value) {
          prevColumn();
        } else {
          nextColumn();
        }
        break;
      }

      case KeyCode.BACKSPACE: {
        if (!searchValue) {
          prevColumn();
        }
        break;
      }

      // >>> Select
      case KeyCode.ENTER: {
        if (validActiveValueCells.value.length) {
          const option = lastActiveOptions.value[lastActiveIndex.value];

          // Search option should revert back of origin options
          const originOptions: DefaultOptionType[] = option?.[SEARCH_MARK] || [];
          if (originOptions.length) {
            onKeyboardSelect(
              originOptions.map((opt) => opt[fieldNames.value.value]),
              originOptions[originOptions.length - 1],
            );
          } else {
            onKeyboardSelect(validActiveValueCells.value, lastActiveOptions.value[lastActiveIndex.value]);
          }
        }
        break;
      }

      // >>> Close
      case KeyCode.ESC: {
        toggleOpen(false);

        if (open) {
          event.stopPropagation();
        }
      }
    }
  },
  onKeyup: () => {},
});
</script>
<template>
  <div
    :class="
      clsx(`${mergedPrefixCls}-menus`, {
        [`${mergedPrefixCls}-menu-empty`]: isEmpty,
        [`${mergedPrefixCls}-rtl`]: rtl,
      })
    "
    ref="containerRef"
  >
    <Render :content="columnNodes" />
  </div>
</template>
