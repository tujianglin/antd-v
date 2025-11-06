import type { VueNode } from '@/vc-util/type';
import type { CSSProperties } from 'vue';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { Orientation } from '../_util/hooks/useOrientation';
import type { SizeType } from '../config-provider/SizeContext';

export type SpaceSize = SizeType | number;
type SemanticName = 'root' | 'item' | 'separator';

export type SpaceClassNamesType = SemanticClassNamesType<SpaceProps, SemanticName>;

export type SpaceStylesType = SemanticStylesType<SpaceProps, SemanticName>;
export interface SpaceProps {
  id?: string;
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
  classNames?: SpaceClassNamesType;
  styles?: SpaceStylesType;
}
