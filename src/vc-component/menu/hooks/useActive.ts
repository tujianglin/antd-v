import { computed, toRefs, type Ref } from 'vue';
import { useMenuContextInject } from '../context/MenuContext';
import type { MenuHoverEventHandler } from '../interface';

interface ActiveObj {
  active: boolean;
  onMouseenter?: (e: MouseEvent) => void;
  onMouseleave?: (e: MouseEvent) => void;
}

export default function useActive(
  eventKey: Ref<string>,
  disabled: Ref<boolean>,
  onMouseenter?: MenuHoverEventHandler,
  onMouseleave?: MenuHoverEventHandler,
): Ref<ActiveObj> {
  const {
    // Active
    activeKey,
    onActive,
    onInactive,
  } = toRefs(useMenuContextInject());

  return computed<ActiveObj>(() => {
    const result = {
      active: activeKey?.value === eventKey?.value,
    } as ActiveObj;
    // Skip when disabled
    if (!disabled.value) {
      result.onMouseenter = (domEvent) => {
        onMouseenter?.({
          key: eventKey?.value,
          domEvent,
        });
        onActive.value(eventKey?.value);
      };
      result.onMouseleave = (domEvent) => {
        onMouseleave?.({
          key: eventKey?.value,
          domEvent,
        });
        onInactive.value(eventKey?.value);
      };
    }
    return result;
  });
}
