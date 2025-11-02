import findDOMNode from '@/vc-util/Dom/findDOMNode';
import { nextTick, ref, toRefs } from 'vue';
import { useFormContextInject } from '../context';
import type { InternalNamePath } from '../interface';

export default function useItemRef() {
  const { itemRef } = toRefs(useFormContextInject());
  const cacheRef = ref<{
    name?: string;
    originRef?: any;
    ref?: any;
  }>({});

  async function getRef(name: InternalNamePath, children: any) {
    await nextTick();
    // Outer caller already check the `supportRef`
    const childrenRef = children && typeof children === 'object' && findDOMNode(children);
    const nameStr = name.join('_');
    if (cacheRef.value.name !== nameStr || cacheRef.value.originRef !== childrenRef) {
      cacheRef.value.name = nameStr;
      cacheRef.value.originRef = childrenRef;
      cacheRef.value.ref = childrenRef;
      itemRef.value(name, childrenRef);
    }
  }

  return getRef;
}
