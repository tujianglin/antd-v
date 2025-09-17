import type { Components } from '@/vc-component/picker/interface';
import { computed, markRaw, type Ref } from 'vue';
import PickerButton from '../PickerButton.vue';

export default function useComponents(components?: Ref<Components>) {
  return computed(() => ({
    button: markRaw(PickerButton),
    ...components.value,
  }));
}
