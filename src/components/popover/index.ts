import InternalPopover from './index.vue';
import PurePanel from './PurePanel.vue';

export type { PopoverProps } from './index.vue';

type CompoundedComponent = typeof InternalPopover & {
  _InternalPanelDoNotUseOrYouWillBeFired: typeof PurePanel;
};

const Popover = InternalPopover as CompoundedComponent;

Popover._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;

export default Popover;
