import { ref } from 'vue';

export default function useRefs<T>(): [getRef: (index: number) => T, setRef: (index: number) => (instance: T) => void] {
  const nodeRef = ref<Record<number, T>>({});

  function getRef(index: number) {
    return nodeRef.value[index];
  }

  function setRef(index: number) {
    return (node: T) => {
      nodeRef.value[index] = node;
    };
  }

  return [getRef, setRef];
}
