import { isEmpty } from 'lodash-es';
import { computed, onBeforeUnmount, ref, watch, type Reactive, type Ref } from 'vue';
import { usePreviewGroupContextInject } from '../context';
import type { ImageElementProps } from '../interface';

let uid = 0;

export default function useRegisterImage(canPreview: Ref<boolean>, data: Reactive<ImageElementProps>) {
  const id = ref(() => {
    uid += 1;
    return String(uid);
  });
  const groupContext = usePreviewGroupContextInject();

  const registerData = computed(() => ({
    data,
    canPreview: canPreview.value,
  }));

  // Keep order start
  // Resolve https://github.com/ant-design/ant-design/issues/28881
  // Only need unRegister when component unMount
  onBeforeUnmount(() => {
    if (!isEmpty(groupContext)) {
      groupContext.register(id.value(), registerData.value);
    }
  });

  watch(
    [canPreview, () => data],
    () => {
      if (!isEmpty(groupContext)) {
        groupContext.register(id.value(), registerData.value);
      }
    },
    { immediate: true, deep: true },
  );

  return computed(() => id.value());
}
