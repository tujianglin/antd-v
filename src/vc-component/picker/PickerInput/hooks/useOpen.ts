import { computed, ref, type Ref } from 'vue';
import type { OpenConfig } from '../../interface';
import useDelayState from './useDelayState';

/**
 * Control the open state.
 * Will not close if activeElement is on the popup.
 */
export default function useOpen(
  open?: Ref<boolean>,
  disabledList: Ref<boolean[]> = ref([]),
  onOpenChange?: (open: boolean) => void,
): [open: Ref<boolean>, setOpen: (open: boolean, config?: OpenConfig) => void] {
  const mergedOpen = computed(() => (disabledList.value.every((disabled) => disabled) ? false : open.value));

  // Delay for handle the open state, in case fast shift from `open` -> `close` -> `open`
  // const [rafOpen, setRafOpen] = useLockState(open, defaultOpen || false, onOpenChange);
  const [rafOpen, setRafOpen] = useDelayState(mergedOpen, onOpenChange);
  function setOpen(next: boolean, config: OpenConfig = {}) {
    if (!config.inherit || rafOpen.value) {
      setRafOpen(next, config.force);
    }
  }

  return [rafOpen, setOpen];
}
