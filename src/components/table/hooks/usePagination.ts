import { omit } from 'es-toolkit/compat';
import { computed, ref, type ComputedRef, type Ref } from 'vue';
import extendsObject from '../../_util/extendsObject';
import type { PaginationProps } from '../../pagination';
import type { TablePaginationConfig } from '../interface';

export const DEFAULT_PAGE_SIZE = 10;

export function getPaginationParam(mergedPagination: TablePaginationConfig, pagination?: TablePaginationConfig | boolean) {
  const param: any = {
    current: mergedPagination.current,
    pageSize: mergedPagination.pageSize,
  };

  const paginationObj = pagination && typeof pagination === 'object' ? pagination : {};

  Object.keys(paginationObj).forEach((pageProp) => {
    const value = mergedPagination[pageProp as keyof typeof paginationObj];

    if (typeof value !== 'function') {
      param[pageProp] = value;
    }
  });

  return param;
}

function usePagination(
  total: Ref<number>,
  onChange: (current: number, pageSize: number) => void,
  pagination?: Ref<TablePaginationConfig | false>,
): [ComputedRef<TablePaginationConfig>, (current?: number, pageSize?: number) => void] {
  const paginationTotal = computed(
    () => (pagination.value && typeof pagination.value === 'object' && pagination.value.total) || 0,
  );
  const paginationObj = computed(() =>
    pagination.value && typeof pagination.value === 'object' ? omit(pagination.value, ['total']) : {},
  );

  const innerPagination = ref<{ current?: number; pageSize?: number }>({
    current: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  // ============ Basic Pagination Config ============
  const mergedPagination = computed(() => {
    const result = extendsObject(innerPagination.value, paginationObj.value, {
      total: paginationTotal.value > 0 ? paginationTotal.value : total.value,
    });
    // Reset `current` if data length or pageSize changed
    const maxPage = Math.ceil((paginationTotal.value || total.value) / result.pageSize!);
    if (result.current! > maxPage) {
      // Prevent a maximum page count of 0
      result.current = maxPage || 1;
    }
    return result;
  });

  const refreshPagination = (current?: number, pageSize?: number) => {
    if (pagination.value === false) return {};
    innerPagination.value = {
      current: current ?? 1,
      pageSize: pageSize || mergedPagination.value.pageSize,
    };
  };

  const onInternalChange: PaginationProps['onChange'] = (current, pageSize) => {
    if (pagination.value) {
      pagination.value.onChange?.(current, pageSize);
    }
    refreshPagination(current, pageSize);
    onChange(current, pageSize || mergedPagination.value.pageSize!);
  };

  return [
    computed(() => {
      if (pagination.value === false) return {};
      return {
        ...mergedPagination.value,
        onChange: onInternalChange,
      };
    }),
    refreshPagination,
  ] as const;
}

export default usePagination;
