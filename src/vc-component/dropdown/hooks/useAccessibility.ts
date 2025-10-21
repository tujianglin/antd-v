import KeyCode from '@/vc-util/KeyCode';
import raf from '@/vc-util/raf';
import { onBeforeUnmount, shallowRef, watch, type Ref } from 'vue';

const { ESC, TAB } = KeyCode;

interface UseAccessibilityProps {
  visible: Ref<boolean>;
  triggerRef: Ref<any>;
  onVisibleChange?: (visible: boolean) => void;
  autofocus?: Ref<boolean>;
  overlayRef?: Ref<any>;
}

export default function useAccessibility({ visible, triggerRef, onVisibleChange, autofocus, overlayRef }: UseAccessibilityProps) {
  const focusMenuRef = shallowRef<boolean>(false);

  const handleCloseMenuAndReturnFocus = () => {
    if (visible.value) {
      triggerRef.value?.focus?.();
      onVisibleChange?.(false);
    }
  };

  const focusMenu = () => {
    if (overlayRef.value?.focus) {
      overlayRef.value.focus();
      focusMenuRef.value = true;
      return true;
    }
    return false;
  };

  const handleKeyDown = (event) => {
    switch (event.keyCode) {
      case ESC:
        handleCloseMenuAndReturnFocus();
        break;
      case TAB: {
        let focusResult: boolean = false;
        if (!focusMenuRef.value) {
          focusResult = focusMenu();
        }

        if (focusResult) {
          event.preventDefault();
        } else {
          handleCloseMenuAndReturnFocus();
        }
        break;
      }
    }
  };

  watch(
    () => visible.value,
    () => {
      if (visible.value) {
        window.addEventListener('keydown', handleKeyDown);
        if (autofocus.value) {
          // FIXME: hack with raf
          raf(focusMenu, 3);
        }
        return () => {};
      }
      return () => {
        focusMenuRef.value = false;
      };
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    if (visible.value) {
      window.removeEventListener('keydown', handleKeyDown);
      focusMenuRef.value = false;
    }
    focusMenuRef.value = false;
  });
}
