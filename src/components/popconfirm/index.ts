import InternalPopconfirm from './index.vue';
import PurePanel from './PurePanel.vue';

export type { PopconfirmProps } from './index.vue';

type CompoundedComponent = typeof InternalPopconfirm & {
  _InternalPanelDoNotUseOrYouWillBeFired: typeof PurePanel;
};

const Popconfirm = InternalPopconfirm as CompoundedComponent;

// We don't care debug panel
/* istanbul ignore next */
Popconfirm._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;

export default Popconfirm;
