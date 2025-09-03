import type { CSSProperties } from 'vue';

export interface OptionProps {
  value?: string;
  key?: string;
  disabled?: boolean;
  children?: any[];
  class?: string;
  style?: CSSProperties;
}
