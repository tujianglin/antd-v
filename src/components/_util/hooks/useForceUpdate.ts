import { ref } from 'vue';

export default function useForceUpdate() {
  const dummy = ref(0);
  return () => {
    dummy.value++;
  };
}
