<script lang="ts">
import { defineComponent, inject, provide, ref, type InjectionKey, type PropType } from 'vue';
import type { FieldData, FormInstance, Store, ValidateMessages } from './interface';

export type Forms = Record<string, FormInstance>;

export interface FormChangeInfo {
  changedFields: FieldData[];
  forms: Forms;
}

export interface FormFinishInfo {
  values: Store;
  forms: Forms;
}

export interface FormProviderProps {
  validateMessages?: ValidateMessages;
  onFormChange?: (name: string, info: FormChangeInfo) => void;
  onFormFinish?: (name: string, info: FormFinishInfo) => void;
}

export interface FormContextProps extends FormProviderProps {
  triggerFormChange: (name: string, changedFields: FieldData[]) => void;
  triggerFormFinish: (name: string, values: Store) => void;
  registerForm: (name: string, form: FormInstance) => void;
  unregisterForm: (name: string) => void;
}

const defaultFormContext: FormContextProps = {
  triggerFormChange: () => {},
  triggerFormFinish: () => {},
  registerForm: () => {},
  unregisterForm: () => {},
};

// 创建 InjectionKey
export const FormContextKey: InjectionKey<FormContextProps> = Symbol('FormContext');

// FormProvider 组件
export const FormProvider = defineComponent({
  name: 'FormProvider',
  props: {
    validateMessages: Object as PropType<ValidateMessages>,
    onFormChange: Function as PropType<(name: string, info: FormChangeInfo) => void>,
    onFormFinish: Function as PropType<(name: string, info: FormFinishInfo) => void>,
  },
  setup(props, { slots }) {
    const parentContext = inject(FormContextKey, defaultFormContext);
    const formsRef = ref<Forms>({});

    const contextValue: FormContextProps = {
      ...parentContext,
      validateMessages: {
        ...parentContext.validateMessages,
        ...props.validateMessages,
      },

      // =========================================================
      // =                  Global Form Control                  =
      // =========================================================
      triggerFormChange: (name, changedFields) => {
        if (props.onFormChange) {
          props.onFormChange(name, {
            changedFields,
            forms: formsRef.value,
          });
        }

        parentContext.triggerFormChange(name, changedFields);
      },
      triggerFormFinish: (name, values) => {
        if (props.onFormFinish) {
          props.onFormFinish(name, {
            values,
            forms: formsRef.value,
          });
        }

        parentContext.triggerFormFinish(name, values);
      },
      registerForm: (name, form) => {
        if (name) {
          formsRef.value = {
            ...formsRef.value,
            [name]: form,
          };
        }

        parentContext.registerForm(name, form);
      },
      unregisterForm: (name) => {
        const newForms = { ...formsRef.value };
        delete newForms[name];
        formsRef.value = newForms;

        parentContext.unregisterForm(name);
      },
    };

    provide(FormContextKey, contextValue);

    return () => slots.default?.();
  },
});

// 导出 hook
export const useFormContext = () => {
  return inject(FormContextKey, defaultFormContext);
};

export default FormProvider;
</script>
