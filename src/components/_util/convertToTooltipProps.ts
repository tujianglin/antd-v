import { isValidElement, isVueNode } from '@/vc-util/Children/util';
import type { VueNode } from '@/vc-util/type';
import type { TooltipProps } from '../tooltip';

function convertToTooltipProps<P extends TooltipProps>(tooltip: P | VueNode): P | null {
  // isNil
  if (!isVueNode(tooltip)) {
    return null;
  }

  if (typeof tooltip === 'object' && !isValidElement(tooltip)) {
    return tooltip as P;
  }

  return { title: tooltip } as P;
}

export default convertToTooltipProps;
