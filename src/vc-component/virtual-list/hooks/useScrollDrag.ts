import { onBeforeUnmount, watch, type Ref } from 'vue';
import raf from '../../../vc-util/raf';

function smoothScrollOffset(offset: number) {
  return Math.floor(offset ** 0.5);
}

export function getPageXY(e: MouseEvent | TouchEvent | MouseEvent | TouchEvent, horizontal: boolean) {
  const obj = 'touches' in e ? e.touches[0] : e;
  return obj[horizontal ? 'pageX' : 'pageY'] - window[horizontal ? 'scrollX' : 'scrollY'];
}

export default function useScrollDrag(
  inVirtual: Ref<boolean>,
  componentRef: Ref<HTMLElement>,
  onScrollOffset: (offset: number) => void,
) {
  let stopScroll, onMouseDown, onMouseUp, onMouseMove;

  watch(
    () => inVirtual.value,
    () => {
      const ele = componentRef.value;
      if (inVirtual && ele) {
        let mouseDownLock = false;
        let rafId: number;
        let offset: number;

        const stopScroll = () => {
          raf.cancel(rafId);
        };

        const continueScroll = () => {
          stopScroll();

          rafId = raf(() => {
            onScrollOffset(offset);
            continueScroll();
          });
        };

        onMouseDown = (e: MouseEvent) => {
          // Skip if element set draggable
          if ((e.target as HTMLElement).draggable || e.button !== 0) {
            return;
          }
          // Skip if nest List has handled this event
          const event = e as MouseEvent & {
            _virtualHandled?: boolean;
          };
          if (!event._virtualHandled) {
            event._virtualHandled = true;
            mouseDownLock = true;
          }
        };
        onMouseUp = () => {
          mouseDownLock = false;
          stopScroll();
        };
        onMouseMove = (e: MouseEvent) => {
          if (mouseDownLock) {
            const mouseY = getPageXY(e, false);
            const { top, bottom } = ele.getBoundingClientRect();

            if (mouseY <= top) {
              const diff = top - mouseY;
              offset = -smoothScrollOffset(diff);
              continueScroll();
            } else if (mouseY >= bottom) {
              const diff = mouseY - bottom;
              offset = smoothScrollOffset(diff);
              continueScroll();
            } else {
              stopScroll();
            }
          }
        };

        ele.addEventListener('mousedown', onMouseDown);
        ele.ownerDocument.addEventListener('mouseup', onMouseUp);
        ele.ownerDocument.addEventListener('mousemove', onMouseMove);
      }
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    const ele = componentRef.value;
    if (!ele) return;
    ele.removeEventListener('mousedown', onMouseDown);
    ele.ownerDocument.removeEventListener('mouseup', onMouseUp);
    ele.ownerDocument.removeEventListener('mousemove', onMouseMove);
    stopScroll?.();
  });
}
