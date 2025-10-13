import type { VueKey } from '@/vc-util/type';

export type TransferKey = VueKey;

export type PaginationType =
  | boolean
  | {
      pageSize?: number;
      simple?: boolean;
      showSizeChanger?: boolean;
      showLessItems?: boolean;
    };

export const OmitProps = ['handleFilter', 'handleClear', 'checkedKeys'] as const;
