import type { VueNode } from '@/vc-util/type';
import { computed, type ComputedRef, type Ref } from 'vue';
import ContextIsolator from '../_util/ContextIsolator';
import Render from '../render';

type RenderFunction<T extends any[]> = (...args: T) => VueNode;

function usePopupRender<T extends [VueNode, ...any[]]>(
  renderFn?: Ref<RenderFunction<T>>,
): ComputedRef<((...args: T) => VueNode) | undefined> {
  return computed(() => {
    if (!renderFn.value) {
      return undefined;
    }
    return (...args: T) => (
      <ContextIsolator space>
        <Render content={renderFn?.value?.(...args)}></Render>
      </ContextIsolator>
    );
  });
}

export default usePopupRender;
