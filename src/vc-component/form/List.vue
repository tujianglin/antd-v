<script lang="tsx">
import { defineComponent, ref, computed, unref, type PropType } from 'vue';
import type { InternalNamePath, NamePath, StoreValue, Meta, InternalFormInstance } from './interface';
import type { Rule } from './interface';
import Field from './Field.vue';
import { move, getNamePath } from './utils/valueUtil';
import { ListContextProvider, useListContextInject, type ListContextProps } from './ListContext.tsx';
import warning from '@/vc-util/warning';
import { FieldContextProvider, useFieldContextInject } from './FieldContext.tsx';

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

export default defineComponent({
  name: 'FormList',
  props: {
    name: {
      type: [String, Number, Array] as PropType<NamePath>,
      required: true,
    },
    initialValue: Array as PropType<any[]>,
    rules: Array as PropType<Rule[]>,
    validateTrigger: {
      type: [String, Array, Boolean] as PropType<string | string[] | false>,
      default: undefined,
    },
    isListField: {
      type: Boolean,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const injectedContext = useFieldContextInject();
    const injectedListContext = useListContextInject();

    const context = computed(() => unref(injectedContext));
    const wrapperListContext = computed(() => unref(injectedListContext));

    const keyRef = ref({ keys: [], id: 0 });

    const keyManager = keyRef.value;

    const prefixName = computed<InternalNamePath>(() => {
      const ctx = context.value;
      const parentPrefixName = getNamePath(ctx?.prefixName) || [];
      return [...parentPrefixName, ...getNamePath(props.name)];
    });

    const fieldContext = computed<InternalFormInstance>(() => ({
      ...context.value,
      prefixName: prefixName.value,
    }));

    // List context
    const listContext = computed<ListContextProps>(() => ({
      getKey: (namePath: InternalNamePath) => {
        const len = prefixName.value.length;
        const pathName = namePath[len];
        return [keyManager.keys[pathName], namePath.slice(len + 1)];
      },
    }));

    // User should not pass children as other type.
    if (typeof slots.default !== 'function') {
      warning(false, 'Form.List only accepts function as children.');
      return () => null;
    }

    const shouldUpdate = (prevValue: StoreValue, nextValue: StoreValue, info: { source?: string }) => {
      if (info.source === 'internal') {
        return false;
      }
      return prevValue !== nextValue;
    };

    return () => (
      <ListContextProvider value={listContext.value}>
        <FieldContextProvider value={fieldContext.value}>
          <Field
            name={[]}
            shouldUpdate={shouldUpdate}
            rules={props.rules}
            validateTrigger={props.validateTrigger}
            initialValue={props.initialValue}
            isList
            isListField={props.isListField ?? !!wrapperListContext.value}
          >
            {{
              default: ({ control, meta }: { control: any; meta: Meta }) => {
                const { value = [], onChange } = control;

                const ctx = context.value;
                const { getFieldValue } = ctx;

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
                      keyManager.keys = [...keyManager.keys.slice(0, index), keyManager.id, ...keyManager.keys.slice(index)];
                      onChange([...newValue.slice(0, index), defaultValue, ...newValue.slice(index)]);
                    } else {
                      if (process.env.NODE_ENV !== 'production' && (index < 0 || index > newValue.length)) {
                        warning(false, 'The second parameter of the add function should be a valid positive number.');
                      }
                      keyManager.keys = [...keyManager.keys, keyManager.id];
                      onChange([...newValue, defaultValue]);
                    }
                    keyManager.id += 1;
                  },
                  remove: (index: number | number[]) => {
                    const newValue = getNewValue();
                    const indexSet = new Set(Array.isArray(index) ? index : [index]);

                    if (indexSet.size <= 0) {
                      return;
                    }
                    keyManager.keys = keyManager.keys.filter((_, keysIndex) => !indexSet.has(keysIndex));

                    const filteredValue = newValue.filter((_, valueIndex) => !indexSet.has(valueIndex));
                    // Trigger store change
                    onChange(filteredValue);
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

                    keyManager.keys = move(keyManager.keys, from, to);

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

                const fields = (listValue as StoreValue[]).map((__, index): ListField => {
                  let key = keyManager.keys[index];
                  if (key === undefined) {
                    keyManager.keys[index] = keyManager.id;
                    key = keyManager.keys[index];
                    keyManager.id += 1;
                  }

                  return {
                    name: index,
                    key,
                    isListField: true,
                  };
                });
                return slots.default?.({ fields, operations, meta });
              },
            }}
          </Field>
        </FieldContextProvider>
      </ListContextProvider>
    );
  },
});
</script>
