import Render from '@/vc-component/render';
import type { VueNode } from '@/vc-util/type';
import { ref, type Ref } from 'vue';

export default function usePatchElement(): [Ref<VueNode[]>, (element: VueNode) => () => void] {
  const elements = ref<VueNode[]>([]);

  const patchElement = (element: VueNode) => {
    // append a new element to elements (and create a new ref)
    elements.value = [...elements.value, <Render content={element}></Render>];

    // return a function that removes the new element out of elements (and create a new ref)
    // it works a little like useEffect
    return () => {
      elements.value = elements.value.filter((ele) => ele !== element);
    };
  };

  return [elements, patchElement];
}
