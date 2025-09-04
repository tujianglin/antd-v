import { ref, watch, type Ref } from 'vue';

export default (
  isScrollAtTop: Ref<boolean>,
  isScrollAtBottom: Ref<boolean>,
  isScrollAtLeft: Ref<boolean>,
  isScrollAtRight: Ref<boolean>,
) => {
  // Do lock for a wheel when scrolling
  const lockRef = ref(false);
  const lockTimeoutRef = ref(null);
  function lockScroll() {
    clearTimeout(lockTimeoutRef.value);

    lockRef.value = true;

    lockTimeoutRef.value = setTimeout(() => {
      lockRef.value = false;
    }, 50);
  }

  // Pass to ref since global add is in closure
  const scrollPingRef = ref({
    top: isScrollAtTop.value,
    bottom: isScrollAtBottom.value,
    left: isScrollAtLeft?.value,
    right: isScrollAtRight?.value,
  });

  watch(
    [isScrollAtTop, isScrollAtBottom, isScrollAtLeft, isScrollAtRight],
    () => {
      scrollPingRef.value = {
        top: isScrollAtTop.value,
        bottom: isScrollAtBottom.value,
        left: isScrollAtLeft?.value,
        right: isScrollAtRight?.value,
      };
    },
    { immediate: true },
  );

  return (isHorizontal: boolean, delta: number, smoothOffset = false) => {
    const originScroll = isHorizontal
      ? // Pass origin wheel when on the left
        (delta < 0 && scrollPingRef.value.left) ||
        // Pass origin wheel when on the right
        (delta > 0 && scrollPingRef.value.right) // Pass origin wheel when on the top
      : (delta < 0 && scrollPingRef.value.top) ||
        // Pass origin wheel when on the bottom
        (delta > 0 && scrollPingRef.value.bottom);

    if (smoothOffset && originScroll) {
      // No need lock anymore when it's smooth offset from touchMove interval
      clearTimeout(lockTimeoutRef.value);
      lockRef.value = false;
    } else if (!originScroll || lockRef.value) {
      lockScroll();
    }

    return !lockRef.value && originScroll;
  };
};
