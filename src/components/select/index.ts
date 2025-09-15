import InternalSelect from './index.vue';

export type { RefSelectProps, SelectProps } from './index.vue';

const SECRET_COMBOBOX_MODE_DO_NOT_USE = 'SECRET_COMBOBOX_MODE_DO_NOT_USE';

type CompoundedComponent = typeof InternalSelect & {
  SECRET_COMBOBOX_MODE_DO_NOT_USE: string;
};

const Select = InternalSelect as CompoundedComponent;

Select.SECRET_COMBOBOX_MODE_DO_NOT_USE = SECRET_COMBOBOX_MODE_DO_NOT_USE;

export default Select;
