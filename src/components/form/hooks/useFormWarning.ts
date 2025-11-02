import { watch, type Reactive } from 'vue';
import { devUseWarning } from '../../_util/warning';
import type { FormProps } from '../Form.vue';

const names: Record<string, number> = {};

export default function useFormWarning(props: Reactive<FormProps>) {
  const warning = devUseWarning('Form');

  watch(
    () => props.name,
    (val, _, cleanup) => {
      if (val) {
        names[val] = (names[val] || 0) + 1;

        warning(names[val] <= 1, 'usage', 'There exist multiple Form with same `val`.');

        cleanup(() => {
          names[val] -= 1;
        });
      }
    },
    { immediate: true },
  );
}
