import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue';

type TouchEventHandler = (e: TouchEvent) => void;
type WheelEventHandler = (e: WheelEvent) => void;

const MIN_SWIPE_DISTANCE = 0.1;
const STOP_SWIPE_DISTANCE = 0.01;
const REFRESH_INTERVAL = 20;
const SPEED_OFF_MULTIPLE = 0.995 ** REFRESH_INTERVAL;

// ================================= Hook =================================
export default function useTouchMove(domRef: Ref<HTMLDivElement>, onOffset: (offsetX: number, offsetY: number) => boolean) {
  const touchPosition = ref<{ x: number; y: number }>();
  const lastTimestamp = ref<number>(0);
  const lastTimeDiff = ref<number>(0);
  const lastOffset = ref<{ x: number; y: number }>();
  const motionRef = ref<number>();

  // ========================= Events =========================
  // >>> Touch events
  function onTouchStart(e: TouchEvent) {
    const { screenX, screenY } = e.touches[0];
    touchPosition.value = { x: screenX, y: screenY };
    window.clearInterval(motionRef.value);
  }

  function onTouchMove(e: TouchEvent) {
    if (!touchPosition.value) return;

    // e.preventDefault();
    const { screenX, screenY } = e.touches[0];
    touchPosition.value = { x: screenX, y: screenY };
    const offsetX = screenX - touchPosition.value.x;
    const offsetY = screenY - touchPosition.value.y;
    onOffset(offsetX, offsetY);
    const now = Date.now();
    lastTimestamp.value = now;
    lastTimeDiff.value = now - lastTimestamp.value;
    lastOffset.value = { x: offsetX, y: offsetY };
  }

  function onTouchEnd() {
    if (!touchPosition.value) return;

    touchPosition.value = null;
    lastOffset.value = null;

    // Swipe if needed
    if (lastOffset.value) {
      const distanceX = lastOffset.value.x / lastTimeDiff.value;
      const distanceY = lastOffset.value.y / lastTimeDiff.value;
      const absX = Math.abs(distanceX);
      const absY = Math.abs(distanceY);

      // Skip swipe if low distance
      if (Math.max(absX, absY) < MIN_SWIPE_DISTANCE) return;

      let currentX = distanceX;
      let currentY = distanceY;

      motionRef.value = window.setInterval(() => {
        if (Math.abs(currentX) < STOP_SWIPE_DISTANCE && Math.abs(currentY) < STOP_SWIPE_DISTANCE) {
          window.clearInterval(motionRef.value);
          return;
        }

        currentX *= SPEED_OFF_MULTIPLE;
        currentY *= SPEED_OFF_MULTIPLE;
        onOffset(currentX * REFRESH_INTERVAL, currentY * REFRESH_INTERVAL);
      }, REFRESH_INTERVAL);
    }
  }

  // >>> Wheel event
  const lastWheelDirectionRef = ref<'x' | 'y'>();

  function onWheel(e: WheelEvent) {
    const { deltaX, deltaY } = e;

    // Convert both to x & y since wheel only happened on PC
    let mixed: number = 0;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    if (absX === absY) {
      mixed = lastWheelDirectionRef.value === 'x' ? deltaX : deltaY;
    } else if (absX > absY) {
      mixed = deltaX;
      lastWheelDirectionRef.value = 'x';
    } else {
      mixed = deltaY;
      lastWheelDirectionRef.value = 'y';
    }

    if (onOffset(-mixed, -mixed)) {
      e.preventDefault();
    }
  }

  // ========================= Effect =========================
  const touchEventsRef = ref<{
    onTouchstart: TouchEventHandler;
    onTouchmove: TouchEventHandler;
    onTouchend: TouchEventHandler;
    onWheel: WheelEventHandler;
  }>(null);
  touchEventsRef.value = { onTouchstart: onTouchStart, onTouchmove: onTouchMove, onTouchend: onTouchEnd, onWheel };

  function onProxyTouchMove(e: TouchEvent) {
    touchEventsRef.value.onTouchmove(e);
  }
  function onProxyTouchEnd(e: TouchEvent) {
    touchEventsRef.value.onTouchend(e);
  }

  onMounted(() => {
    function onProxyTouchStart(e: TouchEvent) {
      touchEventsRef.value.onTouchstart(e);
    }
    function onProxyWheel(e: WheelEvent) {
      touchEventsRef.value.onWheel(e);
    }

    document.addEventListener('touchmove', onProxyTouchMove, { passive: false });
    document.addEventListener('touchend', onProxyTouchEnd, { passive: true });

    // No need to clean up since element removed
    domRef.value?.addEventListener('touchstart', onProxyTouchStart, { passive: true });
    domRef.value?.addEventListener('wheel', onProxyWheel, { passive: false });
  });

  onBeforeUnmount(() => {
    document.removeEventListener('touchmove', onProxyTouchMove);
    document.removeEventListener('touchend', onProxyTouchEnd);
  });
}
