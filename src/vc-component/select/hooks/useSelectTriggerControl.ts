import { onBeforeUnmount, onMounted, type Ref } from 'vue';

export default function useSelectTriggerControl(
  elements: () => (HTMLElement | undefined)[],
  open: Ref<boolean>,
  triggerOpen: (open: boolean) => void,
  customizedTrigger: Ref<boolean>,
) {
  function onGlobalMouseDown(event: MouseEvent) {
    // If trigger is customized, Trigger will take control of popupVisible
    if (customizedTrigger.value) {
      return;
    }

    let target = event.target as HTMLElement;

    if (target.shadowRoot && event.composed) {
      target = (event.composedPath()[0] || target) as HTMLElement;
    }

    if (
      open.value &&
      elements()
        .filter((element) => element)
        .every((element) => !element.contains(target) && element !== target)
    ) {
      // Should trigger close
      triggerOpen(false);
    }
  }

  onMounted(() => {
    window.addEventListener('mousedown', onGlobalMouseDown);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('mousedown', onGlobalMouseDown);
  });
}
