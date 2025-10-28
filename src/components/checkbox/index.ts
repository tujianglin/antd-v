import InternalCheckbox from './Checkbox.vue';
import Group from './Group.vue';

// export type { CheckboxGroupProps, CheckboxOptionType } from './Group';
export type { CheckboxRef } from '../../vc-component/checkbox/index.vue';
export type { CheckboxChangeEvent, CheckboxProps } from './interface';

type CompoundedComponent = typeof InternalCheckbox & {
  Group: typeof Group;
};

const Checkbox = InternalCheckbox as CompoundedComponent;

Checkbox.Group = Group;
export default Checkbox;
