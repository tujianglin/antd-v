import KeyCode from '@/vc-util/KeyCode';
import raf from '@/vc-util/raf';
import { ref, watch, type Ref } from 'vue';

const { ESC, TAB } = KeyCode;

interface UseAccessibilityProps {
  visible: Ref<boolean>;
  triggerRef: Ref<any>;
  onVisibleChange?: (visible: boolean) => void;
  autofocus?: Ref<boolean>;
  overlayRef?: Ref<any>;
}

export default function useAccessibility({ visible, triggerRef, onVisibleChange, autofocus, overlayRef }: UseAccessibilityProps) {
  const focusMenuRef = ref<boolean>(false);

  const handleCloseMenuAndReturnFocus = () => {
    if (visible) {
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
      if (visible) {
        window.addEventListener('keydown', handleKeyDown);
        if (autofocus) {
          // FIXME: hack with raf
          raf(focusMenu, 3);
        }
        return () => {
          window.removeEventListener('keydown', handleKeyDown);
          focusMenuRef.value = false;
        };
      }
      return () => {
        focusMenuRef.value = false;
      };
    },
    { immediate: true },
  );
}
