import BaseSelect from './BaseSelect/index.vue';
import type { BaseSelectProps, BaseSelectPropsWithoutPrivate, BaseSelectRef } from './BaseSelect/interface';
import type { SelectProps } from './interface';
import OptGroup from './OptGroup.vue';
import Option from './Option.vue';
import TypeSelect from './Select.vue';
export { useBaseSelectContextInject, useBaseSelectContextProvider } from './hooks/useBaseProps';

export { BaseSelect, OptGroup, Option };
export type { BaseSelectProps, BaseSelectPropsWithoutPrivate, BaseSelectRef, SelectProps };

type CompoundedComponent = typeof TypeSelect & {
  Option: typeof Option;
  OptGroup: typeof OptGroup;
};

const Select = TypeSelect as CompoundedComponent;
Select.Option = Option;
Select.OptGroup = OptGroup;

export default Select;
