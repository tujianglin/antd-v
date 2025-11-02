import type { FormInstance as RcFormInstance } from '@/vc-component/form';
import { useForm as useRcForm } from '@/vc-component/form';
import scrollIntoView from 'scroll-into-view-if-needed';

import { getDOM } from '@/vc-util/Dom/findDOMNode';
import type { VueNode } from '@/vc-util/type';
import { reactiveComputed, type ReactiveComputedReturn } from '@vueuse/core';
import { shallowRef, unref } from 'vue';
import type { InternalNamePath, NamePath, ScrollOptions } from '../interface';
import { getFieldId, toArray } from '../util';

export interface FormInstance<Values = any> extends RcFormInstance<Values> {
  scrollToField: (name: NamePath, options?: ScrollOptions) => void;
  focusField: (name: NamePath) => void;
  /** @internal: This is an internal usage. Do not use in your prod */
  __INTERNAL__: {
    /** No! Do not use this in your code! */
    name?: string;
    /** No! Do not use this in your code! */
    itemRef: (name: InternalNamePath, domRef: any) => void;
  };
  getFieldInstance: (name: NamePath) => any;
}

export function toNamePathStr(name: NamePath) {
  const namePath = toArray(name);
  return namePath.join('_');
}

function getFieldDOMNode(name: NamePath, wrapForm: FormInstance) {
  const field = wrapForm.getFieldInstance(name);
  const fieldDom = getDOM(field);

  if (fieldDom) {
    return fieldDom;
  }

  const fieldId = getFieldId(toArray(name), wrapForm.__INTERNAL__.name);
  if (fieldId) {
    return document.getElementById(fieldId);
  }
}

export default function useForm<Values = any>(form?: FormInstance<Values>): [ReactiveComputedReturn<FormInstance<Values>>] {
  const [rcFormRef] = useRcForm();
  const itemsRef = shallowRef<Record<string, VueNode>>({});

  const wrapForm = reactiveComputed<FormInstance<Values>>(() => {
    const rcForm = unref(rcFormRef);
    return (
      form ?? {
        ...rcForm,
        __INTERNAL__: {
          itemRef: (name: InternalNamePath, node) => {
            const namePathStr = toNamePathStr(name);
            if (node) {
              itemsRef.value[namePathStr] = node;
            } else {
              // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
              delete itemsRef.value[namePathStr];
            }
          },
        },
        scrollToField: (name: NamePath, options: ScrollOptions = {}) => {
          const { focus, ...restOpt } = options;
          const node = getFieldDOMNode(name, wrapForm);
          if (node) {
            scrollIntoView(node, {
              scrollMode: 'if-needed',
              block: 'nearest',
              ...restOpt,
            } as any);

            // Focus if scroll success
            if (focus) {
              wrapForm.focusField(name);
            }
          }
        },
        focusField: (name: NamePath) => {
          const itemRef = wrapForm.getFieldInstance(name);

          if (typeof itemRef?.focus === 'function') {
            itemRef.focus();
          } else {
            getFieldDOMNode(name, wrapForm)?.focus?.();
          }
        },
        getFieldInstance: (name: NamePath) => {
          const namePathStr = toNamePathStr(name);
          return itemsRef.value[namePathStr];
        },
      }
    );
  });

  return [wrapForm];
}
