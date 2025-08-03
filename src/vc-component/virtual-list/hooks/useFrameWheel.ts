import { ref, type Ref } from 'vue';
import raf from '../../../vc-util/raf';
import isFF from '../utils/isFirefox';
import useOriginScroll from './useOriginScroll';

interface FireFoxDOMMouseScrollEvent {
  detail: number;
  preventDefault: VoidFunction;
}

export default function useFrameWheel(
  inVirtual: Ref<boolean>,
  isScrollAtTop: Ref<boolean>,
  isScrollAtBottom: Ref<boolean>,
  isScrollAtLeft: Ref<boolean>,
  isScrollAtRight: Ref<boolean>,
  horizontalScroll: Ref<boolean>,
  /***
   * Return `true` when you need to prevent default event
   */
  onWheelDelta: (offset: number, horizontal: boolean) => void,
): [(e: WheelEvent) => void, (e: FireFoxDOMMouseScrollEvent) => void] {
  const offsetRef = ref(0);
  const nextFrameRef = ref<number>(null);

  // Firefox patch
  const wheelValueRef = ref<number>(null);
  const isMouseScrollRef = ref<boolean>(false);

  // Scroll status sync
  const originScroll = useOriginScroll(isScrollAtTop, isScrollAtBottom, isScrollAtLeft, isScrollAtRight);

  function onWheelY(e: WheelEvent, deltaY: number) {
    raf.cancel(nextFrameRef.value);

    // Do nothing when scroll at the edge, Skip check when is in scroll
    if (originScroll(false, deltaY)) return;

    // Skip if nest List has handled this event
    const event = e as WheelEvent & {
      _virtualHandled?: boolean;
    };
    if (!event._virtualHandled) {
      event._virtualHandled = true;
    } else {
      return;
    }

    offsetRef.value += deltaY;
    wheelValueRef.value = deltaY;

    // Proxy of scroll events
    if (!isFF) {
      event.preventDefault();
    }

    nextFrameRef.value = raf(() => {
      // Patch a multiple for Firefox to fix wheel number too small
      // ref: https://github.com/ant-design/ant-design/issues/26372#issuecomment-679460266
      const patchMultiple = isMouseScrollRef.value ? 10 : 1;
      onWheelDelta(offsetRef.value * patchMultiple, false);
      offsetRef.value = 0;
    });
  }

  function onWheelX(event: WheelEvent, deltaX: number) {
    onWheelDelta(deltaX, true);

    if (!isFF) {
      event.preventDefault();
    }
  }

  // Check for which direction does wheel do. `sx` means `shift + wheel`
  const wheelDirectionRef = ref<'x' | 'y' | 'sx' | null>(null);
  const wheelDirectionCleanRef = ref<number>(null);

  function onWheel(event: WheelEvent) {
    if (!inVirtual) return;

    // Wait for 2 frame to clean direction
    raf.cancel(wheelDirectionCleanRef.value);
    wheelDirectionCleanRef.value = raf(() => {
      wheelDirectionRef.value = null;
    }, 2);

    const { deltaX, deltaY, shiftKey } = event;

    let mergedDeltaX = deltaX;
    let mergedDeltaY = deltaY;

    if (wheelDirectionRef.value === 'sx' || (!wheelDirectionRef.value && (shiftKey || false) && deltaY && !deltaX)) {
      mergedDeltaX = deltaY;
      mergedDeltaY = 0;

      wheelDirectionRef.value = 'sx';
    }

    const absX = Math.abs(mergedDeltaX);
    const absY = Math.abs(mergedDeltaY);

    if (wheelDirectionRef.value === null) {
      wheelDirectionRef.value = horizontalScroll && absX > absY ? 'x' : 'y';
    }

    if (wheelDirectionRef.value === 'y') {
      onWheelY(event, mergedDeltaY);
    } else {
      onWheelX(event, mergedDeltaX);
    }
  }

  // A patch for firefox
  function onFireFoxScroll(event: FireFoxDOMMouseScrollEvent) {
    if (!inVirtual) return;
    isMouseScrollRef.value = event.detail === wheelValueRef.value;
  }

  return [onWheel, onFireFoxScroll];
}
