import raf from '@/vc-util/raf';
import { onBeforeUnmount, onMounted, ref, shallowRef, type Ref } from 'vue';

type Updater<ValueType> = (prev?: ValueType) => ValueType;

export default function useFrameState<ValueType>(
  defaultValue: ValueType,
): [Ref<ValueType>, (updater: Updater<ValueType>) => void] {
  const value = ref<any>(defaultValue);
  const frameRef = shallowRef<number | null>(null);
  const batchRef = shallowRef<Updater<ValueType>[]>([]);
  const destroyRef = shallowRef(false);

  onMounted(() => {
    destroyRef.value = false;
  });

  onBeforeUnmount(() => {
    destroyRef.value = true;
    raf.cancel(frameRef.value!);
    frameRef.value = null;
  });

  function setFrameValue(updater: Updater<ValueType>) {
    if (destroyRef.value) {
      return;
    }

    if (frameRef.value === null) {
      batchRef.value = [];
      frameRef.value = raf(() => {
        frameRef.value = null;
        let res = value.value;

        batchRef.value.forEach((func) => {
          res = func(res);
        });
        value.value = res;
      });
    }

    batchRef.value.push(updater);
  }

  return [value, setFrameValue] as const;
}
