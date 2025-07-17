import type { CSSProperties } from 'vue';
import type { Orientation } from '../_util/hooks/useOrientation';
import type { CustomComponent } from '../_util/type';
import type { SizeType } from '../config-provider/SizeContext';

export interface FlexProps {
  class?: string;
  style?: CSSProperties;
  prefixCls?: string;
  rootClassName?: string;
  vertical?: boolean;
  orientation?: Orientation;
  wrap?: boolean | CSSProperties['flexWrap'];
  justify?: CSSProperties['justifyContent'];
  align?: CSSProperties['alignItems'];
  flex?: CSSProperties['flex'];
  gap?: CSSProperties['gap'] | SizeType;
  component?: CustomComponent;
}
