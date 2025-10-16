import type { VueNode } from '@/vc-util/type';
import type { CSSProperties } from 'vue';
import type { Orientation } from '../_util/hooks/useOrientation';
import type { SizeType } from '../config-provider/SizeContext';

export type SpaceSize = SizeType | number;
type SemanticName = 'root' | 'item' | 'separator';
export interface SpaceProps {
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
  style?: CSSProperties;
  size?: SpaceSize | [SpaceSize, SpaceSize];
  vertical?: boolean;
  orientation?: Orientation;
  // No `stretch` since many components do not support that.
  align?: 'start' | 'end' | 'center' | 'baseline';
  separator?: VueNode;
  wrap?: boolean;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
}
