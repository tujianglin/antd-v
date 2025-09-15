import Select from '../select';
import RefAutoComplete from './AutoComplete.vue';

export type { AutoCompleteProps } from './AutoComplete.vue';

const { Option } = Select;

type CompoundedComponent = typeof RefAutoComplete & {
  Option: typeof Option;
};

const AutoComplete = RefAutoComplete as CompoundedComponent;

AutoComplete.Option = Option;

export default AutoComplete;
