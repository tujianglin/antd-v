import type { ComponentToken as WaveToken } from '../../_util/wave/style';
import type { ComponentToken as AffixComponentToken } from '../../affix/style';
import type { ComponentToken as AlertComponentToken } from '../../alert/style';
import type { ComponentToken as AnchorComponentToken } from '../../anchor/style';
import type { ComponentToken as AppComponentToken } from '../../app/style';
import type { ComponentToken as AvatarComponentToken } from '../../avatar/style';
import type { ComponentToken as ButtonComponentToken } from '../../button/style';
import type { ComponentToken as CheckboxComponentToken } from '../../checkbox/style';
import type { ComponentToken as ColorPickerComponentToken } from '../../color-picker/style';
import type { ComponentToken as EmptyComponentToken } from '../../empty/style';
import type { ComponentToken as FlexComponentToken } from '../../flex/style';
import type { ComponentToken as FloatButtonComponentToken } from '../../float-button/style';
import type { ComponentToken as GridComponentToken } from '../../grid/style';
import type { ComponentToken as InputNumberComponentToken } from '../../input-number/style';
import type { ComponentToken as InputComponentToken } from '../../input/style';
import type { ComponentToken as PopoverComponentToken } from '../../popover/style';
import type { ComponentToken as RadioComponentToken } from '../../radio/style';
import type { ComponentToken as SpaceComponentToken } from '../../space/style';
import type { ComponentToken as TooltipComponentToken } from '../../tooltip/style';

export interface ComponentTokenMap {
  Affix?: AffixComponentToken;
  Alert?: AlertComponentToken;
  Anchor?: AnchorComponentToken;
  Avatar?: AvatarComponentToken;
  Button?: ButtonComponentToken;
  ColorPicker?: ColorPickerComponentToken;
  FloatButton?: FloatButtonComponentToken;
  Flex?: FlexComponentToken;
  Grid?: GridComponentToken;
  Space?: SpaceComponentToken;
  Input?: InputComponentToken;
  InputNumber?: InputNumberComponentToken;
  Popover?: PopoverComponentToken;
  Radio?: RadioComponentToken;
  Tooltip?: TooltipComponentToken;
  Checkbox?: CheckboxComponentToken;
  Empty?: EmptyComponentToken;
  App?: AppComponentToken;
  /** @private Internal TS definition. Do not use. */
  Wave?: WaveToken;
}
