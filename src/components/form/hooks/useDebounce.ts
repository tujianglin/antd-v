import { ref, watch, type Ref } from 'vue';

export default function useDebounce<T>(value: Ref<T[]>) {
  const cacheValue = ref(value.value);
  watch(value, (_, _1, cleanup) => {
    const timeout = setTimeout(
      () => {
        cacheValue.value = value.value;
      },
      value.value.length ? 0 : 10,
    );

    cleanup(() => {
      clearTimeout(timeout);
    });
  });

  return cacheValue;
}
