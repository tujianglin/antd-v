import { reactiveComputed } from '@vueuse/core';
import { computed, onBeforeUnmount, ref, toRefs, watch, type Reactive } from 'vue';
import { isImageValid } from '../util';

type ImageStatus = 'normal' | 'error' | 'loading';

export default function useStatus(
  props: Reactive<{
    src: string;
    isCustomPlaceholder?: boolean;
    fallback?: string;
  }>,
) {
  const { src, isCustomPlaceholder, fallback } = toRefs(reactiveComputed(() => props));
  const status = ref<ImageStatus>(isCustomPlaceholder?.value ? 'loading' : 'normal');
  const isLoaded = ref(false);
  const isError = computed(() => status.value === 'error');

  // https://github.com/react-component/image/pull/187
  let isCurrentSrc = true;
  watch(
    src,
    () => {
      isImageValid(src.value).then((isValid) => {
        // https://github.com/ant-design/ant-design/issues/44948
        // If src changes, the previous setStatus should not be triggered
        if (!isValid && isCurrentSrc) {
          status.value = 'error';
        }
      });
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    isCurrentSrc = false;
  });

  watch(
    src,
    () => {
      if (isCustomPlaceholder?.value && !isLoaded.value) {
        status.value = 'loading';
      } else if (isError.value) {
        status.value = 'normal';
      }
    },
    { immediate: true },
  );

  const onLoad = () => {
    status.value = 'normal';
  };

  const getImgRef = (el) => {
    isLoaded.value = false;
    if (status.value === 'loading' && el?.complete && (el.naturalWidth || el.naturalHeight)) {
      isLoaded.value = true;
      onLoad();
    }
  };

  const srcAndOnload = computed(() => (isError.value && fallback.value ? { src: fallback.value } : { onLoad, src: src.value }));

  return [getImgRef, srcAndOnload, status] as const;
}
