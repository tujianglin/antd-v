import { nextTick, onBeforeUnmount, ref, watch, type Ref } from 'vue';
import { getShadowRoot } from '../../../vc-util/Dom/shadow';
import warning from '../../../vc-util/warning';
import { getWin } from '../util';

/**
 * Close if click on the window.
 * Return the function that click on the Popup element.
 */
export default function useWinClick(
  open: Ref<boolean>,
  clickToHide: Ref<boolean>,
  targetEle: Ref<HTMLElement>,
  popupEle: Ref<HTMLElement>,
  mask: Ref<boolean>,
  maskClosable: Ref<boolean>,
  inPopupOrChild: (target: EventTarget) => boolean,
  triggerOpen: (open: boolean) => void,
) {
  const openRef = ref<boolean>();
  watch(open, (val) => {
    openRef.value = val;
  });

  const popupPointerDownRef = ref<boolean>(false);
  let win, targetShadowRoot;

  const onPointerDown = () => {
    popupPointerDownRef.value = false;
  };

  const onTriggerClose = (e: MouseEvent) => {
    if (openRef.value && !inPopupOrChild(e.composedPath?.()?.[0] || e.target) && !popupPointerDownRef.value) {
      triggerOpen(false);
    }
  };

  // Click to hide is special action since click popup element should not hide
  watch([clickToHide, targetEle, popupEle, mask, maskClosable], async ([val1, val2, val3, val4, val5]) => {
    await nextTick();
    if (val1 && val3 && (!val4 || val5)) {
      win = getWin(val2);

      win?.addEventListener('pointerdown', onPointerDown, true);
      win?.addEventListener('mousedown', onTriggerClose, true);
      win?.addEventListener('contextmenu', onTriggerClose, true);

      // shadow root
      targetShadowRoot = getShadowRoot(val2) as unknown as HTMLElement;
      if (targetShadowRoot) {
        targetShadowRoot.addEventListener('mousedown', onTriggerClose, true);
        targetShadowRoot.addEventListener('contextmenu', onTriggerClose, true);
      }

      // Warning if target and popup not in same root
      if (process.env.NODE_ENV !== 'production') {
        const targetRoot = val2?.getRootNode?.();
        const popupRoot = val3.getRootNode?.();
        warning(targetRoot === popupRoot, `trigger element and popup element should in same shadow root.`);
      }

      return () => {};
    }
  });

  onBeforeUnmount(() => {
    if (win) {
      win.removeEventListener('pointerdown', onPointerDown, true);
      win.removeEventListener('mousedown', onTriggerClose, true);
      win.removeEventListener('contextmenu', onTriggerClose, true);
    }

    if (targetShadowRoot) {
      targetShadowRoot.removeEventListener('mousedown', onTriggerClose, true);
      targetShadowRoot.removeEventListener('contextmenu', onTriggerClose, true);
    }
  });
  function onPopupPointerDown() {
    popupPointerDownRef.value = true;
  }

  return onPopupPointerDown;
}
