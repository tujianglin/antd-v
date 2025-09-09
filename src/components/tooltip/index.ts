import InternalTooltip from './index.vue';
import PurePanel from './PurePanel.vue';

export type { TooltipProps } from './index.vue';

type CompoundedComponent = typeof InternalTooltip & {
  _InternalPanelDoNotUseOrYouWillBeFired: typeof PurePanel;
};

const Tooltip = InternalTooltip as CompoundedComponent;

Tooltip._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;

export default Tooltip;
