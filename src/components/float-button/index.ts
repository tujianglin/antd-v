import BackTop from './BackTop.vue';
import FloatButtonComp from './FloatButton.vue';
import FloatButtonGroup from './FloatButtonGroup.vue';

type CompoundedComponent = typeof FloatButtonComp & {
  Group: typeof FloatButtonGroup;
  BackTop: typeof BackTop;
};

const FloatButton = FloatButtonComp as CompoundedComponent;
FloatButton.Group = FloatButtonGroup;
FloatButton.BackTop = BackTop;

export default FloatButton;
