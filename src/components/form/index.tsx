import { useWatch } from '@/vc-component/form';
import { FormItemPrefixContextProvider } from './context';
import ErrorList from './ErrorList.vue';
import InternalForm from './Form.vue';
import FormItem from './FormItem';
import FormList from './FormList.vue';
import useForm from './hooks/useForm';
import type {
  ErrorListProps,
  FormInstance,
  FormItemProps,
  FormListProps,
  FormProps,
  Rule,
  RuleObject,
  RuleRender,
} from './interface';

export type { ErrorListProps, FormInstance, FormItemProps, FormListProps, FormProps, Rule, RuleObject, RuleRender };

export type FormListFieldData = { name: number; key: number };
export type FormListOperation = {
  add: (defaultValue?: any, insertIndex?: number) => void;
  remove: (index: number | number[]) => void;
  move: (from: number, to: number) => void;
};

// Create compound component
type CompoundedComponent = typeof InternalForm & {
  useForm: typeof useForm;
  useWatch: typeof useWatch;
  Item: typeof FormItem;
  List: typeof FormList;
  ErrorList: typeof ErrorList;
};

const Form = InternalForm as CompoundedComponent;
Form.useForm = useForm;
Form.useWatch = useWatch;
Form.Item = FormItem;
Form.List = FormList;
Form.ErrorList = ErrorList;

export { ErrorList, FormItem, FormItemPrefixContextProvider, FormList, useForm };
export default Form;
