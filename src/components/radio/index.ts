import Group from './group.vue';
import InternalRadio from './index.vue';
import Button from './radioButton.vue';
export type { CheckboxRef as RadioRef } from '@/vc-component/checkbox/index.vue';
export type {
  RadioChangeEvent,
  RadioChangeEventTarget,
  RadioGroupButtonStyle,
  RadioGroupContextProps,
  RadioGroupOptionType,
  RadioGroupProps,
  RadioProps,
} from './interface';
export { Button, Group };

type CompoundedComponent = typeof InternalRadio & {
  Group: typeof Group;
  Button: typeof Button;
};

const Radio = InternalRadio as CompoundedComponent;
Radio.Group = Group;
Radio.Button = Button;

export default Radio;
