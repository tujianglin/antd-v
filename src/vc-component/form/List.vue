<script lang="tsx" setup>
import warning from '@/vc-util/warning';
import { computed, shallowRef, type VNode } from 'vue';
import Field from './Field.vue';
import FieldContextProvider, { useFieldContextInject } from './FieldContext';
import type { InternalFormInstance, InternalNamePath, NamePath, Rule, StoreValue } from './interface';
import ListContextProvider, { useListContextInject, type ListContextProps } from './ListContext';
import { getNamePath, move } from './utils/valueUtil';

export interface ListField {
  name: number;
  key: number;
  isListField: boolean;
}

export interface ListOperations {
  add: (defaultValue?: StoreValue, index?: number) => void;
  remove: (index: number | number[]) => void;
  move: (from: number, to: number) => void;
}

export interface ListProps<Values = any> {
  name: NamePath<Values>;
  rules?: Rule[];
  validateTrigger?: string | string[] | false;
  initialValue?: any[];
  /** @private Passed by Form.List props. Do not use since it will break by path check. */
  isListField?: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { name, initialValue, rules, validateTrigger = undefined, isListField = undefined } = defineProps<ListProps>();

const slots = defineSlots<{
  default: (props: { fields: any[]; operations: ListOperations; meta: any }) => VNode[];
}>();

const context = useFieldContextInject() as any;
const wrapperListContext = useListContextInject();
const keyRef = shallowRef({ keys: [], id: 0 });

const keyManager = computed(() => keyRef.value);

const prefixName = computed<InternalNamePath>(() => {
  const parentPrefixName = getNamePath(context.prefixName) || [];
  return [...parentPrefixName, ...getNamePath(name)];
});

const fieldContext = computed<InternalFormInstance>(() => ({ ...context, prefixName }));

// List context
const listContext = computed<ListContextProps>(() => ({
  getKey: (namePath: InternalNamePath) => {
    const len = prefixName.value.length;
    const pathName = namePath[len];
    return [keyManager.value.keys[pathName], namePath.slice(len + 1)];
  },
}));

const shouldUpdate = (prevValue, nextValue, { source }: any) => {
  if (source === 'internal') {
    return false;
  }
  return prevValue !== nextValue;
};

const RenderContent = ({ control: { value = [], onChange }, meta }) => {
  const { getFieldValue } = context;
  const getNewValue = () => {
    const values = getFieldValue(prefixName.value || []) as StoreValue[];
    return values || [];
  };
  /**
   * Always get latest value in case user update fields by `form` api.
   */
  const operations: ListOperations = {
    add: (defaultValue, index?: number) => {
      // Mapping keys
      const newValue = getNewValue();

      if (index >= 0 && index <= newValue.length) {
        onChange([...newValue.slice(0, index), defaultValue, ...newValue.slice(index)]);
      } else {
        if (process.env.NODE_ENV !== 'production' && (index < 0 || index > newValue.length)) {
          warning(false, 'The second parameter of the add function should be a valid positive number.');
        }
        keyManager.value.keys = [...keyManager.value.keys, keyManager.value.id];
        onChange([...newValue, defaultValue]);
      }
      keyManager.value.id += 1;
    },
    remove: (index: number | number[]) => {
      const newValue = getNewValue();
      const indexSet = new Set(Array.isArray(index) ? index : [index]);

      if (indexSet.size <= 0) {
        return;
      }
      keyManager.value.keys = keyManager.value.keys.filter((_, keysIndex) => !indexSet.has(keysIndex));

      // Trigger store change
      onChange(newValue.filter((_, valueIndex) => !indexSet.has(valueIndex)));
    },
    move(from: number, to: number) {
      if (from === to) {
        return;
      }
      const newValue = getNewValue();

      // Do not handle out of range
      if (from < 0 || from >= newValue.length || to < 0 || to >= newValue.length) {
        return;
      }

      keyManager.value.keys = move(keyManager.value.keys, from, to);

      // Trigger store change
      onChange(move(newValue, from, to));
    },
  };

  let listValue = value || [];
  if (!Array.isArray(listValue)) {
    listValue = [];

    if (process.env.NODE_ENV !== 'production') {
      warning(false, `Current value of '${prefixName.value.join(' > ')}' is not an array type.`);
    }
  }

  return slots.default({
    fields: (listValue as StoreValue[]).map((__, index): ListField => {
      let key = keyManager.value.keys[index];
      if (key === undefined) {
        keyManager.value.keys[index] = keyManager.value.id;
        key = keyManager.value.keys[index];
        keyManager.value.id += 1;
      }

      return {
        name: index,
        key,
        isListField: true,
      };
    }),
    operations,
    meta,
  });
};
</script>
<template>
  <ListContextProvider :value="listContext">
    <FieldContextProvider :value="fieldContext">
      <Field
        :name="[]"
        :should-update="shouldUpdate"
        :rules="rules"
        :validate-trigger="validateTrigger"
        :initial-value="initialValue"
        is-list
        :is-list-field="isListField ?? !!wrapperListContext"
      >
        <template #default="props">
          <RenderContent v-bind="props" />
        </template>
      </Field>
    </FieldContextProvider>
  </ListContextProvider>
</template>
