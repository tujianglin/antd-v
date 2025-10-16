import { getShadowRoot } from '@/vc-util/Dom/shadow';
import warning from '@/vc-util/warning';
import { nextTick, onBeforeUnmount, shallowRef, watch, watchEffect, type Ref } from 'vue';
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
  const openRef = shallowRef<boolean>();
  watchEffect(() => {
    openRef.value = open.value;
  });

  const popupPointerDownRef = shallowRef<boolean>(false);
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
  watch([clickToHide, targetEle, popupEle, mask, maskClosable], async () => {
    await nextTick();
    if (clickToHide.value && popupEle.value && (!mask.value || maskClosable.value)) {
      win = getWin(targetEle.value);

      win?.addEventListener('pointerdown', onPointerDown, true);
      win?.addEventListener('mousedown', onTriggerClose, true);
      win?.addEventListener('contextmenu', onTriggerClose, true);

      // shadow root
      targetShadowRoot = getShadowRoot(targetEle.value) as unknown as HTMLElement;
      if (targetShadowRoot) {
        targetShadowRoot.addEventListener('mousedown', onTriggerClose, true);
        targetShadowRoot.addEventListener('contextmenu', onTriggerClose, true);
      }

      // Warning if target and popup not in same root
      if (process.env.NODE_ENV !== 'production') {
        const targetRoot = targetEle.value?.getRootNode?.();
        const popupRoot = popupEle.value.getRootNode?.();
        warning(targetRoot === popupRoot, `trigger element and popup element should in same shadow root.`);
      }
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
