import type { DataNode } from '@/components/tree';
import { INTERNAL_COL_DEFINE } from '@/vc-component/table';
import type { FixedType } from '@/vc-component/table/interface';
import { arrAdd, arrDel } from '@/vc-component/tree/util';
import { conductCheck } from '@/vc-component/tree/utils/conductUtil';
import { convertDataToEntities } from '@/vc-component/tree/utils/treeUtil';
import useControlledState from '@/vc-util/hooks/useControlledState';
import type { VueKey, VueNode } from '@/vc-util/type';
import { DownOutlined } from '@ant-design/icons-vue';
import { reactiveComputed, type ReactiveComputedReturn } from '@vueuse/core';
import clsx from 'clsx';
import { computed, ref, toRefs, watch, watchEffect, type ComputedRef } from 'vue';
import { useMultipleSelect } from '../../_util/hooks';
import { devUseWarning } from '../../_util/warning';
import type { CheckboxProps } from '../../checkbox';
import Checkbox from '../../checkbox';
import Dropdown from '../../dropdown';
import Radio from '../../radio';
import type {
  ColumnsType,
  ColumnType,
  ExpandType,
  GetPopupContainer,
  GetRowKey,
  Key,
  RowSelectMethod,
  SelectionItem,
  TableLocale,
  TableRowSelection,
  TransformColumns,
} from '../interface';

// TODO: warning if use ajax!!!

export const SELECTION_COLUMN = {
  key: 'SELECTION_COLUMN',
} as const;
export const SELECTION_ALL = 'SELECT_ALL' as const;
export const SELECTION_INVERT = 'SELECT_INVERT' as const;
export const SELECTION_NONE = 'SELECT_NONE' as const;

const EMPTY_LIST: VueKey[] = [];

type RecordType = any;

interface UseSelectionConfig {
  prefixCls: string;
  pageData: RecordType[];
  data: RecordType[];
  getRowKey: GetRowKey;
  getRecordByKey: (key: Key) => RecordType;
  expandType: ExpandType;
  childrenColumnName: string;
  locale: TableLocale;
  getPopupContainer?: GetPopupContainer;
}

export type INTERNAL_SELECTION_ITEM = SelectionItem | typeof SELECTION_ALL | typeof SELECTION_INVERT | typeof SELECTION_NONE;

const flattenData = (childrenColumnName, data?: RecordType[], list: RecordType[] = []): RecordType[] => {
  (data || []).forEach((record) => {
    list.push(record);
    if (record && typeof record === 'object' && childrenColumnName in record) {
      flattenData(childrenColumnName, record[childrenColumnName], list);
    }
  });
  return list;
};

const useSelection = (
  config: ReactiveComputedReturn<UseSelectionConfig>,
  rowSelection?: ComputedRef<TableRowSelection>,
): [TransformColumns, ComputedRef<Set<Key>>] => {
  const {
    preserveSelectedRowKeys,
    selectedRowKeys,
    defaultSelectedRowKeys,
    getCheckboxProps,
    getTitleCheckboxProps,
    onChange: onSelectionChange,
    onSelect,
    columnWidth: selectionColWidth,
    type: selectionType,
    selections,
    fixed,
    renderCell: customizeRenderCell,
    hideSelectAll,
  } = toRefs(reactiveComputed(() => rowSelection.value || {}));

  const checkStrictly = computed(() => rowSelection.value?.checkStrictly || true);

  const {
    prefixCls,
    data,
    pageData,
    getRecordByKey,
    getRowKey,
    expandType,
    childrenColumnName,
    locale: tableLocale,
    getPopupContainer,
  } = toRefs(config);

  const warning = devUseWarning('Table');

  // ========================= MultipleSelect =========================
  const [, updatePrevSelectedIndex] = useMultipleSelect((item) => item);

  // ========================= Keys =========================
  const [mergedSelectedKeys, setMergedSelectedKeys] = useControlledState(
    defaultSelectedRowKeys?.value || EMPTY_LIST,
    selectedRowKeys,
  );

  // ======================== Caches ========================
  const preserveRecordsRef = ref(new Map<Key, any>());

  const updatePreserveRecordsCache = (keys: Key[]) => {
    if (preserveSelectedRowKeys?.value) {
      const newCache = new Map<Key, RecordType>();
      // Keep key if mark as preserveSelectedRowKeys
      keys.forEach((key) => {
        let record = getRecordByKey.value(key);

        if (!record && preserveRecordsRef.value.has(key)) {
          record = preserveRecordsRef.value.get(key)!;
        }

        newCache.set(key, record);
      });
      // Refresh to new cache
      preserveRecordsRef.value = newCache;
    }
  };

  // Update cache with selectedKeys
  watchEffect(() => {
    updatePreserveRecordsCache(mergedSelectedKeys.value);
  });

  // Get flatten data
  const flattedData = computed(() => flattenData(childrenColumnName.value, pageData.value));

  const keyEntities = computed(() => {
    if (checkStrictly.value) {
      return null;
    }
    let convertData = data.value;
    if (preserveSelectedRowKeys?.value) {
      // use flattedData keys
      const keysSet = new Set(flattedData.value.map(getRowKey.value));

      // remove preserveRecords that duplicate data
      const preserveRecords = Array.from(preserveRecordsRef.value).reduce(
        (total: RecordType[], [key, value]) => (keysSet.has(key) ? total : total.concat(value)),
        [],
      );
      convertData = [...convertData, ...preserveRecords];
    }
    return convertDataToEntities(convertData as unknown as DataNode[], {
      externalGetKey: getRowKey.value,
      childrenPropName: childrenColumnName.value,
    }).keyEntities;
  });

  // Get all checkbox props
  const checkboxPropsMap = computed(() => {
    const map = new Map<Key, Partial<CheckboxProps>>();
    flattedData.value.forEach((record, index) => {
      const key = getRowKey.value(record, index);
      const checkboxProps = (getCheckboxProps ? getCheckboxProps.value(record) : null) || {};
      map.set(key, checkboxProps);

      warning(
        !('checked' in checkboxProps || 'defaultChecked' in checkboxProps),
        'usage',
        'Do not set `checked` or `defaultChecked` in `getCheckboxProps`. Please use `selectedRowKeys` instead.',
      );
    });
    return map;
  });

  const isCheckboxDisabled = (r: RecordType) => {
    const rowKey = getRowKey.value(r);
    let checkboxProps: Partial<CheckboxProps> | undefined;
    if (checkboxPropsMap.value.has(rowKey)) {
      checkboxProps = checkboxPropsMap.value.get(getRowKey.value(r));
    } else {
      checkboxProps = getCheckboxProps.value ? getCheckboxProps.value(r) : undefined;
    }
    return !!checkboxProps?.disabled;
  };

  const derivedKeys = computed(() => {
    if (checkStrictly.value) {
      return [mergedSelectedKeys.value || [], []];
    }
    const { checkedKeys, halfCheckedKeys } = conductCheck(mergedSelectedKeys.value, true, keyEntities.value, isCheckboxDisabled);
    return [checkedKeys || [], halfCheckedKeys];
  });

  const derivedSelectedKeys = computed(() => derivedKeys.value?.[0]);
  const derivedHalfSelectedKeys = computed(() => derivedKeys.value?.[1]);

  const derivedSelectedKeySet = computed<Set<Key>>(() => {
    const keys = selectionType?.value === 'radio' ? derivedSelectedKeys.value.slice(0, 1) : derivedSelectedKeys.value;
    return new Set(keys);
  });

  const derivedHalfSelectedKeySet = computed<Set<Key>>(() =>
    selectionType?.value === 'radio' ? new Set() : new Set(derivedHalfSelectedKeys.value),
  );

  // Reset if rowSelection reset
  watch(
    rowSelection,
    () => {
      if (!rowSelection.value) {
        setMergedSelectedKeys(EMPTY_LIST);
      }
    },
    { immediate: true, deep: true },
  );

  const setSelectedKeys = (keys: Key[], method: RowSelectMethod) => {
    let availableKeys: Key[];
    let records: RecordType[];

    updatePreserveRecordsCache(keys);

    if (preserveSelectedRowKeys?.value) {
      availableKeys = keys;
      records = keys.map((key) => preserveRecordsRef.value.get(key)!);
    } else {
      // Filter key which not exist in the `dataSource`
      availableKeys = [];
      records = [];

      keys.forEach((key) => {
        const record = getRecordByKey.value(key);
        if (record !== undefined) {
          availableKeys.push(key);
          records.push(record);
        }
      });
    }

    setMergedSelectedKeys(availableKeys);

    onSelectionChange?.value?.(availableKeys, records, { type: method });
  };

  // ====================== Selections ======================
  // Trigger single `onSelect` event
  const triggerSingleSelection = (key: Key, selected: boolean, keys: Key[], event: Event) => {
    if (onSelect) {
      const rows = keys.map((k) => getRecordByKey.value(k));
      onSelect.value(getRecordByKey.value(key), selected, rows, event);
    }

    setSelectedKeys(keys, 'single');
  };

  const mergedSelections = computed<SelectionItem[] | null>(() => {
    if (!selections?.value || hideSelectAll?.value) {
      return null;
    }

    const selectionList: INTERNAL_SELECTION_ITEM[] =
      selections?.value === true ? [SELECTION_ALL, SELECTION_INVERT, SELECTION_NONE] : selections?.value;

    return selectionList
      .map((selection: INTERNAL_SELECTION_ITEM) => {
        if (selection === SELECTION_ALL) {
          return {
            key: 'all',
            text: tableLocale.value.selectionAll,
            onSelect() {
              setSelectedKeys(
                data.value
                  .map((record, index) => getRowKey.value(record, index))
                  .filter((key) => {
                    const checkProps = checkboxPropsMap.value.get(key);
                    return !checkProps?.disabled || derivedSelectedKeySet.value.has(key);
                  }),
                'all',
              );
            },
          };
        }
        if (selection === SELECTION_INVERT) {
          return {
            key: 'invert',
            text: tableLocale.value.selectInvert,
            onSelect() {
              const keySet = new Set(derivedSelectedKeySet.value);
              pageData.value.forEach((record, index) => {
                const key = getRowKey.value(record, index);
                const checkProps = checkboxPropsMap.value.get(key);

                if (!checkProps?.disabled) {
                  if (keySet.has(key)) {
                    keySet.delete(key);
                  } else {
                    keySet.add(key);
                  }
                }
              });

              const keys = Array.from(keySet);
              setSelectedKeys(keys, 'invert');
            },
          };
        }
        if (selection === SELECTION_NONE) {
          return {
            key: 'none',
            text: tableLocale.value.selectNone,
            onSelect() {
              setSelectedKeys(
                Array.from(derivedSelectedKeySet.value).filter((key) => {
                  const checkProps = checkboxPropsMap.value.get(key);
                  return checkProps?.disabled;
                }),
                'none',
              );
            },
          };
        }
        return selection as SelectionItem;
      })
      .map((selection) => ({
        ...selection,
        onSelect: (...rest) => {
          selection.onSelect?.(...rest);
          updatePrevSelectedIndex(null);
        },
      }));
  });

  // ======================= Columns ========================
  const transformColumns = (columns: ColumnsType): ColumnsType => {
    // >>>>>>>>>>> Skip if not exists `rowSelection`
    if (!rowSelection.value) {
      return columns?.filter((col) => col.key !== SELECTION_COLUMN.key);
    }

    // >>>>>>>>>>> Support selection
    let cloneColumns = [...columns];

    // Make keySet reactive to derivedSelectedKeySet changes.
    const keySet = new Set(derivedSelectedKeySet.value);

    // Record key only need check with enabled
    const recordKeys = flattedData.value.map(getRowKey.value).filter((key) => !checkboxPropsMap.value.get(key)!.disabled);
    const checkedCurrentAll = recordKeys.every((key) => keySet.has(key));
    const checkedCurrentSome = recordKeys.some((key) => keySet.has(key));

    const onSelectAllChange = () => {
      const changeKeys: Key[] = [];

      if (checkedCurrentAll) {
        recordKeys.forEach((key) => {
          keySet.delete(key);
          changeKeys.push(key);
        });
      } else {
        recordKeys.forEach((key) => {
          if (!keySet.has(key)) {
            keySet.add(key);
            changeKeys.push(key);
          }
        });
      }

      const keys = Array.from(keySet);

      setSelectedKeys(keys, 'all');
      updatePrevSelectedIndex(null);
    };

    // ===================== Render =====================
    // Title Cell
    let title: VueNode;
    let columnTitleCheckbox: VueNode;
    if (selectionType?.value !== 'radio') {
      let customizeSelections: VueNode;
      if (mergedSelections.value) {
        const menu = {
          getPopupContainer: getPopupContainer.value,
          items: mergedSelections.value.map((selection, index) => {
            const { key, text, onSelect: onSelectionClick } = selection;

            return {
              key: key ?? index,
              onClick: () => {
                onSelectionClick?.(recordKeys);
              },
              label: text,
            };
          }),
        };
        customizeSelections = (
          <div class={`${prefixCls.value}-selection-extra`}>
            <Dropdown menu={menu} getPopupContainer={getPopupContainer.value}>
              <span>
                <DownOutlined />
              </span>
            </Dropdown>
          </div>
        );
      }

      const allDisabledData = flattedData.value
        .map((record, index) => {
          const key = getRowKey.value(record, index);
          const checkboxProps = checkboxPropsMap.value.get(key) || {};
          return { checked: keySet.has(key), ...checkboxProps };
        })
        .filter(({ disabled }) => disabled);

      const allDisabled = !!allDisabledData.length && allDisabledData.length === flattedData.value.length;

      const allDisabledAndChecked = allDisabled && allDisabledData.every(({ checked }) => checked);
      const allDisabledSomeChecked = allDisabled && allDisabledData.some(({ checked }) => checked);
      const customCheckboxProps = getTitleCheckboxProps?.value?.() || {};
      const { onChange, disabled } = customCheckboxProps;
      columnTitleCheckbox = (
        <Checkbox
          aria-label={customizeSelections ? 'Custom selection' : 'Select all'}
          {...customCheckboxProps}
          checked={!allDisabled ? !!flattedData.value.length && checkedCurrentAll : allDisabledAndChecked}
          indeterminate={
            !allDisabled ? !checkedCurrentAll && checkedCurrentSome : !allDisabledAndChecked && allDisabledSomeChecked
          }
          onChange={(e) => {
            onSelectAllChange();
            onChange?.(e);
          }}
          disabled={disabled ?? (flattedData.value.length === 0 || allDisabled)}
          skipGroup
        />
      );

      title = !hideSelectAll?.value && (
        <div class={`${prefixCls.value}-selection`}>
          {columnTitleCheckbox}
          {customizeSelections}
        </div>
      );
    }
    // Body Cell
    let renderCell: (_: RecordType, record: RecordType, index: number) => { node: VueNode; checked: boolean };
    if (selectionType?.value === 'radio') {
      renderCell = (_, record, index) => {
        const key = getRowKey.value(record, index);
        const checked = keySet.has(key);
        const checkboxProps = checkboxPropsMap.value.get(key);
        return {
          node: (
            <Radio
              {...(checkboxProps as any)}
              value={checked}
              onClick={(e) => {
                e.stopPropagation();
                checkboxProps?.onClick?.(e);
              }}
              onChange={(event: any) => {
                if (!keySet.has(key)) {
                  triggerSingleSelection(key, true, [key], event.nativeEvent);
                }
                checkboxProps?.onChange?.(event);
              }}
            />
          ),
          checked,
        };
      };
    } else {
      renderCell = (_, record, index) => {
        const key = getRowKey.value(record, index);
        const checked = keySet.has(key);
        const indeterminate = derivedHalfSelectedKeySet.value.has(key);
        const checkboxProps = checkboxPropsMap.value.get(key);
        let mergedIndeterminate: boolean;
        if (expandType.value === 'nest') {
          mergedIndeterminate = indeterminate;
          warning(
            typeof checkboxProps?.indeterminate !== 'boolean',
            'usage',
            'set `indeterminate` using `rowSelection.getCheckboxProps` is not allowed with tree structured dataSource.',
          );
        } else {
          mergedIndeterminate = checkboxProps?.indeterminate ?? indeterminate;
        }

        // Record checked
        return {
          node: (
            <Checkbox
              {...checkboxProps}
              indeterminate={mergedIndeterminate}
              checked={checked}
              skipGroup
              onClick={(e) => {
                e.stopPropagation();
                checkboxProps?.onClick?.(e);
              }}
              onChange={(event) => {
                const { nativeEvent } = event;
                const { shiftKey } = nativeEvent;
                const currentSelectedIndex = recordKeys.indexOf(key);
                const isMultiple = derivedSelectedKeys.value.some((item) => recordKeys.includes(item));

                if (shiftKey && checkStrictly.value && isMultiple) {
                  const keys = Array.from(keySet);
                  setSelectedKeys(keys, 'multiple');
                } else {
                  // Single record selected
                  const originCheckedKeys = derivedSelectedKeys.value;
                  if (checkStrictly.value) {
                    const checkedKeys = checked ? arrDel(originCheckedKeys, key) : arrAdd(originCheckedKeys, key);
                    triggerSingleSelection(key, !checked, checkedKeys, nativeEvent);
                  } else {
                    // Always fill first
                    const result = conductCheck([...originCheckedKeys, key], true, keyEntities.value, isCheckboxDisabled);
                    const { checkedKeys, halfCheckedKeys } = result;
                    let nextCheckedKeys = checkedKeys;

                    // If remove, we do it again to correction
                    if (checked) {
                      const tempKeySet = new Set(checkedKeys);
                      tempKeySet.delete(key);
                      nextCheckedKeys = conductCheck(
                        Array.from(tempKeySet),
                        { checked: false, halfCheckedKeys },
                        keyEntities.value,
                        isCheckboxDisabled,
                      ).checkedKeys;
                    }

                    triggerSingleSelection(key, !checked, nextCheckedKeys, nativeEvent);
                  }
                }

                if (checked) {
                  updatePrevSelectedIndex(null);
                } else {
                  updatePrevSelectedIndex(currentSelectedIndex);
                }
                checkboxProps?.onChange?.(event);
              }}
            />
          ),
          checked,
        };
      };
    }

    const renderSelectionCell = (_: any, record: RecordType, index: number) => {
      const { node, checked } = renderCell(_, record, index);

      if (customizeRenderCell?.value) {
        return customizeRenderCell?.value(checked, record, index, node);
      }

      return node;
    };

    const flag = cloneColumns.some((col) => col.key === SELECTION_COLUMN.key);
    // Insert selection column if not exist
    if (!flag) {
      // Always after expand icon
      if (cloneColumns.findIndex((col: any) => col[INTERNAL_COL_DEFINE]?.columnType === 'EXPAND_COLUMN') === 0) {
        const [expandColumn, ...restColumns] = cloneColumns;
        cloneColumns = [expandColumn, SELECTION_COLUMN, ...restColumns];
      } else {
        // Normal insert at first column
        cloneColumns = [SELECTION_COLUMN, ...cloneColumns];
      }
    }

    // Deduplicate selection column
    const selectionColumnIndex = cloneColumns.findIndex((col) => col.key === SELECTION_COLUMN.key);

    cloneColumns = cloneColumns.filter((column, index) => column.key !== SELECTION_COLUMN.key || index === selectionColumnIndex);

    // Fixed column logic
    const prevCol: ColumnType & Record<string, any> = cloneColumns[selectionColumnIndex - 1];
    const nextCol: ColumnType & Record<string, any> = cloneColumns[selectionColumnIndex + 1];

    let mergedFixed: FixedType | undefined = fixed?.value;

    if (mergedFixed === undefined) {
      if (nextCol?.fixed !== undefined) {
        mergedFixed = nextCol.fixed;
      } else if (prevCol?.fixed !== undefined) {
        mergedFixed = prevCol.fixed;
      }
    }

    if (mergedFixed && prevCol && prevCol[INTERNAL_COL_DEFINE]?.columnType === 'EXPAND_COLUMN' && prevCol.fixed === undefined) {
      prevCol.fixed = mergedFixed;
    }

    const columnCls = clsx(`${prefixCls.value}-selection-col`, {
      [`${prefixCls.value}-selection-col-with-dropdown`]: selections?.value && selectionType?.value === 'checkbox',
    });

    const renderColumnTitle = () => {
      if (!rowSelection?.value?.columnTitle) {
        return title;
      }
      if (typeof rowSelection?.value.columnTitle === 'function') {
        return (rowSelection?.value.columnTitle as any)(columnTitleCheckbox);
      }
      return rowSelection?.value.columnTitle;
    };

    // Replace with real selection column
    const selectionColumn: ColumnsType[0] & {
      RC_TABLE_INTERNAL_COL_DEFINE: Record<string, any>;
    } = {
      fixed: mergedFixed,
      width: selectionColWidth?.value,
      class: `${prefixCls.value}-selection-column`,
      title: renderColumnTitle(),
      render: renderSelectionCell,
      onCell: rowSelection?.value.onCell,
      align: rowSelection?.value.align,
      [INTERNAL_COL_DEFINE]: { class: columnCls },
    };

    return cloneColumns.map((col) => (col.key === SELECTION_COLUMN.key ? selectionColumn : col));
  };

  return [transformColumns, derivedSelectedKeySet] as const;
};

export default useSelection;
