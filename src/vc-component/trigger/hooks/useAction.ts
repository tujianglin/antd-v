import { computed, type ComputedRef, type Ref } from 'vue';
import type { ActionType } from '../interface';

type InternalActionType = ActionType | 'touch';

type ActionTypes = InternalActionType | InternalActionType[];

function toArray<T>(val?: T | T[]) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
}

export default function useAction(
  action: Ref<ActionTypes>,
  showAction?: Ref<ActionTypes>,
  hideAction?: Ref<ActionTypes>,
): [showActions: ComputedRef<Set<InternalActionType>>, hideActions: ComputedRef<Set<InternalActionType>>] {
  const showActionSet = computed(() => {
    const mergedShowAction = toArray(showAction.value ?? action.value);
    const result = new Set(mergedShowAction);
    if (result.has('hover') && !result.has('click')) {
      result.add('touch');
    }
    return result;
  });

  const hideActionSet = computed(() => {
    const mergedHideAction = toArray(hideAction.value ?? action.value);
    const result = new Set(mergedHideAction);
    if (result.has('hover') && !result.has('click')) {
      result.add('touch');
    }
    return result;
  });
  return [showActionSet, hideActionSet];
}
