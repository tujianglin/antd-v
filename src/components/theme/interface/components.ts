import type { ComponentToken as WaveToken } from '../../_util/wave/style';
import type { ComponentToken as ButtonComponentToken } from '../../button/style';
import type { ComponentToken as CheckboxComponentToken } from '../../checkbox/style';
import type { ComponentToken as FlexComponentToken } from '../../flex/style';
import type { ComponentToken as FloatButtonComponentToken } from '../../float-button/style';
import type { ComponentToken as GridComponentToken } from '../../grid/style';
import type { ComponentToken as InputNumberComponentToken } from '../../input-number/style';
import type { ComponentToken as InputComponentToken } from '../../input/style';
import type { ComponentToken as RadioComponentToken } from '../../radio/style';
import type { ComponentToken as SelectComponentToken } from '../../select/style';
import type { ComponentToken as SpaceComponentToken } from '../../space/style';

export interface ComponentTokenMap {
  Button?: ButtonComponentToken;
  FloatButton?: FloatButtonComponentToken;
  Flex?: FlexComponentToken;
  Grid?: GridComponentToken;
  Space?: SpaceComponentToken;
  Input?: InputComponentToken;
  InputNumber?: InputNumberComponentToken;
  Radio?: RadioComponentToken;
  /** @private Internal TS definition. Do not use. */
  Wave?: WaveToken;
  Checkbox?: CheckboxComponentToken;
  Select?: SelectComponentToken;
}
