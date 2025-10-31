import Field from './Field.vue';
import { useFieldContextInject } from './FieldContext.tsx';
import InternalForm, { type FormProps } from './Form.vue';
import { FormProvider } from './FormContext.tsx';
import type { FormInstance, FormRef } from './interface';
import List from './List.vue';
import { useListContextInject } from './ListContext.tsx';
import useForm from './useForm';
import useWatch from './useWatch';

// Type exports

type InternalFormType = typeof InternalForm;
interface RefFormType extends InternalFormType {
  FormProvider: typeof FormProvider;
  Field: typeof Field;
  List: typeof List;
  useForm: typeof useForm;
  useWatch: typeof useWatch;
}

const RefForm: RefFormType = InternalForm as RefFormType;

RefForm.FormProvider = FormProvider;
RefForm.Field = Field;
RefForm.List = List;
RefForm.useForm = useForm;
RefForm.useWatch = useWatch;

export { Field, FormProvider, List, useFieldContextInject, useForm, useListContextInject, useWatch };

export type { FormInstance, FormProps, FormRef };

export default RefForm;
