import Render from '@/vc-component/render/render';
import { reactiveComputed, type ReactiveComputedReturn } from '@vueuse/core';
import { defineComponent, ref, watch } from 'vue';
import usePatchElement from '../../_util/hooks/usePatchElement';
import type { ModalFunc, ModalStaticFunctions } from '../confirm';
import { withConfirm, withError, withInfo, withSuccess, withWarn } from '../confirm';
import destroyFns from '../destroyFns';
import type { ModalFuncProps } from '../interface';
import type { HookModalRef } from './HookModal.vue';
import HookModal from './HookModal.vue';

let uuid = 0;

interface ElementsHolderRef {
  patchElement: ReturnType<typeof usePatchElement>[1];
}

// Add `then` field for `ModalFunc` return instance.
export type ModalFuncWithPromise = (...args: Parameters<ModalFunc>) => ReturnType<ModalFunc> & {
  then<T>(resolve: (confirmed: boolean) => T, reject: VoidFunction): Promise<T>;
};

export type HookAPI = Omit<Record<keyof ModalStaticFunctions, ModalFuncWithPromise>, 'warn'>;

const ElementsHolder = defineComponent({
  inheritAttrs: false,
  setup(_, { expose }) {
    const [elements, patchElement] = usePatchElement();

    expose({
      patchElement,
    });

    return () => <Render content={elements.value}></Render>;
  },
});

function useModal(): readonly [instance: ReactiveComputedReturn<HookAPI>, contextHolder: any] {
  const holderRef = ref<ElementsHolderRef>(null);

  // ========================== Effect ==========================
  const actionQueue = ref<VoidFunction[]>([]);

  watch(
    actionQueue,
    () => {
      if (actionQueue.value.length) {
        const cloneQueue = [...actionQueue.value];

        cloneQueue.forEach((action) => {
          action();
        });

        actionQueue.value = [];
      }
    },
    { immediate: true, deep: true },
  );

  // =========================== Hook ===========================
  const getConfirmFunc = (withFunc: (config: ModalFuncProps) => ModalFuncProps) => {
    return function hookConfirm(config: ModalFuncProps) {
      uuid += 1;

      const modalRef = ref<HookModalRef>();

      // Proxy to promise with `onClose`
      let resolvePromise: (confirmed: boolean) => void;
      const promise = new Promise<boolean>((resolve) => {
        resolvePromise = resolve;
      });
      let silent = false;

      let closeFunc: (() => void) | undefined;
      const modal = () => (
        <HookModal
          key={`modal-${uuid}`}
          config={withFunc(config)}
          ref={modalRef}
          afterClose={() => {
            closeFunc?.();
          }}
          isSilent={() => silent}
          onConfirm={(confirmed) => {
            resolvePromise(confirmed);
          }}
        />
      );

      closeFunc = holderRef.value?.patchElement(modal);

      if (closeFunc) {
        destroyFns.push(closeFunc);
      }

      const instance: ReturnType<ModalFuncWithPromise> = {
        destroy: () => {
          function destroyAction() {
            modalRef.value?.destroy();
          }

          if (modalRef.value) {
            destroyAction();
          } else {
            actionQueue.value = [...actionQueue.value, destroyAction];
          }
        },
        update: (newConfig) => {
          function updateAction() {
            modalRef.value?.update(newConfig);
          }

          if (modalRef.value) {
            updateAction();
          } else {
            actionQueue.value = [...actionQueue.value, updateAction];
          }
        },
        then: (resolve) => {
          silent = true;
          return promise.then(resolve);
        },
      };

      return instance;
    };
  };
  const fns = reactiveComputed<HookAPI>(() => ({
    info: getConfirmFunc(withInfo),
    success: getConfirmFunc(withSuccess),
    error: getConfirmFunc(withError),
    warning: getConfirmFunc(withWarn),
    confirm: getConfirmFunc(withConfirm),
  }));
  return [fns, () => <ElementsHolder key="modal-holder" ref={holderRef} />] as const;
}

export default useModal;
