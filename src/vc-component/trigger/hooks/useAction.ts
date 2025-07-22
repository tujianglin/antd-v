import { reactiveComputed } from '@vueuse/core';
import type { Reactive, Ref } from 'vue';
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
): Reactive<{ showActions: Set<InternalActionType>; hideActions: Set<InternalActionType> }> {
  return reactiveComputed(() => {
    const mergedShowAction = toArray(showAction.value ?? action.value);
    const mergedHideAction = toArray(hideAction.value ?? action.value);

    const showActionSet = new Set(mergedShowAction);
    const hideActionSet = new Set(mergedHideAction);

    if (showActionSet.has('hover') && !showActionSet.has('click')) {
      showActionSet.add('touch');
    }

    if (hideActionSet.has('hover') && !hideActionSet.has('click')) {
      hideActionSet.add('touch');
    }

    return { showActions: showActionSet, hideActions: hideActionSet };
  });
}
