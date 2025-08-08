import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';

export default function useSelectTriggerControl(
  elements: () => (HTMLElement | undefined)[],
  open: Ref<boolean>,
  triggerOpen: (open: boolean) => void,
  customizedTrigger: Ref<boolean>,
) {
  const propsRef = ref(null);

  watch(
    [open, customizedTrigger],
    () => {
      propsRef.value = {
        open: open.value,
        triggerOpen,
        customizedTrigger: customizedTrigger.value,
      };
    },
    { deep: true, immediate: true },
  );

  function onGlobalMouseDown(event: MouseEvent) {
    // If trigger is customized, Trigger will take control of popupVisible
    if (propsRef.value?.customizedTrigger) {
      return;
    }

    let target = event.target as HTMLElement;

    if (target.shadowRoot && event.composed) {
      target = (event.composedPath()[0] || target) as HTMLElement;
    }

    if (
      propsRef.value.open &&
      elements()
        .filter((element) => element)
        .every((element) => !element.contains(target) && element !== target)
    ) {
      // Should trigger close
      propsRef.value.triggerOpen(false);
    }
  }

  onMounted(() => {
    window.addEventListener('mousedown', onGlobalMouseDown);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('mousedown', onGlobalMouseDown);
  });
}
