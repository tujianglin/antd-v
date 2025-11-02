<script lang="tsx" setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type CSSProperties,
  type FormHTMLAttributes,
  type VNode,
} from 'vue';
import type { BatchTask, BatchUpdateRef } from './BatchUpdate.vue';
import BatchUpdate from './BatchUpdate.vue';
import { FieldContextProvider, HOOK_MARK } from './FieldContext';
import { useFormContextInject } from './FormContext';
import type { Callbacks, FieldData, FormInstance, InternalFormInstance, Store, ValidateMessages } from './interface';
import { ListContextProvider } from './ListContext';
import useForm from './useForm';
import { isSimilar } from './utils/valueUtil';

type BaseFormProps = Omit<FormHTMLAttributes, 'onSubmit' | 'children'>;

type RenderProps = (props: { values: Store; form: FormInstance }) => VNode;

export interface FormProps<Values = any> extends /** @vue-ignore */ BaseFormProps {
  class?: string;
  style?: CSSProperties;
  initialValues?: Store;
  form?: FormInstance<Values>;
  component?: any;
  fields?: FieldData[];
  name?: string;
  validateMessages?: ValidateMessages;
  onValuesChange?: Callbacks<Values>['onValuesChange'];
  onFieldsChange?: Callbacks<Values>['onFieldsChange'];
  onFinish?: Callbacks<Values>['onFinish'];
  onFinishFailed?: Callbacks<Values>['onFinishFailed'];
  validateTrigger?: string | string[] | false;
  preserve?: boolean;
  clearOnDestroy?: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  name,
  initialValues,
  fields,
  form,
  preserve,
  component: DomCompoennt = 'form',
  validateMessages,
  validateTrigger = 'onChange',
  onValuesChange,
  onFieldsChange,
  onFinish,
  onFinishFailed,
  clearOnDestroy,
  ...restProps
} = defineProps<FormProps>();

const slots = defineSlots<{
  default: (props?: Parameters<RenderProps>[0]) => VNode[];
}>();

const nativeElementRef = ref<HTMLFormElement>(null);
const formContext = useFormContextInject();

// We customize handle event since Context will makes all the consumer re-render:
// https://reactjs.org/docs/context.html#contextprovider
const [formInstance] = useForm(form);
const { useSubscribe, setInitialValues, setCallbacks, setValidateMessages, setPreserve, destroyForm, setBatchUpdate } = (
  formInstance as InternalFormInstance
).getInternalHooks(HOOK_MARK);

// Pass ref with form instance
defineExpose({
  ...formInstance,
  get nativeElement() {
    return nativeElementRef.value;
  },
});

// Register form into Context
onMounted(() => {
  formContext.registerForm(name, formInstance);
});

onBeforeUnmount(() => {
  formContext.unregisterForm(name);
});

// Pass props to store
watch(
  () => [formContext.validateMessages, validateMessages],
  () => {
    setValidateMessages({
      ...formContext.validateMessages,
      ...validateMessages,
    });
  },
  { immediate: true, deep: true },
);

watch(
  () => [onValuesChange, onFieldsChange, onFinish, onFinishFailed],
  () => {
    setCallbacks({
      onValuesChange,
      onFieldsChange: (changedFields: FieldData[], ...rest) => {
        formContext.triggerFormChange(name, changedFields);

        if (onFieldsChange) {
          onFieldsChange(changedFields, ...rest);
        }
      },
      onFinish: (values: Store) => {
        formContext.triggerFormFinish(name, values);

        if (onFinish) {
          onFinish(values);
        }
      },
      onFinishFailed,
    });
  },
  { immediate: true },
);
watch(
  () => preserve,
  () => {
    setPreserve(preserve);
  },
  { immediate: true },
);
// Set initial value, init store value when first mount
const mountRef = ref(false);
watch(
  () => initialValues,
  () => {
    setInitialValues(initialValues, !mountRef.value);
    if (!mountRef.value) {
      mountRef.value = true;
    }
  },
  { immediate: true, deep: true },
);
// ======================== Batch Update ========================
// zombieJ:
// To avoid Form self re-render,
// We create a sub component `BatchUpdate` to handle batch update logic.
// When the call with do not change immediate, we will batch the update
// and flush it in `useLayoutEffect` for next tick.

// Set batch update ref
const batchUpdateRef = ref<BatchUpdateRef>(null);
const batchUpdateTasksRef = ref<[key: string, fn: VoidFunction][]>([]);

const tryFlushBatch = () => {
  if (batchUpdateRef.value) {
    batchUpdateTasksRef.value.forEach(([key, fn]) => {
      batchUpdateRef.value.batch(key, fn);
    });
    batchUpdateTasksRef.value = [];
  }
};

// Ref update
const setBatchUpdateRef = (batchUpdate) => {
  batchUpdateRef.value = batchUpdate;
  if (batchUpdate) {
    nextTick().then(tryFlushBatch);
  }
};

// Task list

const batchUpdate: BatchTask = (key, callback) => {
  batchUpdateTasksRef.value.push([key, callback]);
  tryFlushBatch();
};

setBatchUpdate(batchUpdate);

// ========================== Unmount ===========================
onBeforeUnmount(() => {
  destroyForm(clearOnDestroy);
});

// Prepare children by `children` type
// In Vue, slots.default is always a function, different from React
// We should always use subscribe mode in Vue
const childrenRenderProps = computed(() => false); // Always false in Vue

// Always use subscribe mode in Vue
watch(
  childrenRenderProps,
  () => {
    useSubscribe(true); // Always true for Vue
  },
  { immediate: true },
);

// Listen if fields provided. We use ref to save prev data here to avoid additional render
const prevFieldsRef = ref<FieldData[] | undefined>(undefined);
watch(
  () => fields,
  (newFields) => {
    if (!isSimilar(prevFieldsRef.value || [], newFields || [])) {
      formInstance.setFields(newFields || []);
    }
    prevFieldsRef.value = newFields;
  },
  { deep: true },
);
// =========================== Render ===========================
const formContextValue = computed<InternalFormInstance>(() => ({
  ...(formInstance as InternalFormInstance),
  validateTrigger,
}));

const ChildrenNode = () => {
  let childrenNode;
  if (childrenRenderProps.value) {
    const values = formInstance.getFieldsValue(true);
    childrenNode = slots.default?.({ values, form: formInstance });
  } else {
    childrenNode = slots.default?.();
  }
  return childrenNode;
};
</script>
<template>
  <ListContextProvider v-if="DomCompoennt === false" :value="null">
    <FieldContextProvider :value="formContextValue">
      <ChildrenNode />
    </FieldContextProvider>
    <BatchUpdate :ref="setBatchUpdateRef" />
  </ListContextProvider>
  <component
    v-else
    :is="DomCompoennt"
    v-bind="{ ...restProps, ...$attrs }"
    ref="nativeElementRef"
    @submit="
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        formInstance.submit();
      }
    "
    @reset="
      (event) => {
        event.preventDefault();
        formInstance.resetFields();
        restProps.onReset?.(event);
      }
    "
  >
    <ListContextProvider :value="null">
      <FieldContextProvider :value="formContextValue">
        <ChildrenNode />
      </FieldContextProvider>
      <BatchUpdate :ref="setBatchUpdateRef" />
    </ListContextProvider>
  </component>
</template>
