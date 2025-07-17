import type { ComponentToken as WaveToken } from '../../_util/wave/style';
import type { ComponentToken as ButtonComponentToken } from '../../button/style';
import type { ComponentToken as FlexComponentToken } from '../../flex/style';
import type { ComponentToken as FloatButtonComponentToken } from '../../float-button/style';
import type { ComponentToken as GridComponentToken } from '../../grid/style';
import type { ComponentToken as InputComponentToken } from '../../input/style';
import type { ComponentToken as SpaceComponentToken } from '../../space/style';

export interface ComponentTokenMap {
  Button?: ButtonComponentToken;
  FloatButton?: FloatButtonComponentToken;
  Flex?: FlexComponentToken;
  Grid?: GridComponentToken;
  Space?: SpaceComponentToken;
  Input?: InputComponentToken;
  /** @private Internal TS definition. Do not use. */
  Wave?: WaveToken;
}
