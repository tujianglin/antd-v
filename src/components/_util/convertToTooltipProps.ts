import { isValidElement } from '@/vc-util/Children/util';
import type { VueNode } from '@/vc-util/type';
import type { TooltipProps } from '../tooltip';

function convertToTooltipProps<P extends TooltipProps>(tooltip: P | VueNode): P | null {
  // isNil
  if (tooltip === undefined || tooltip === null) {
    return null;
  }

  if (typeof tooltip === 'object' && !isValidElement(tooltip)) {
    return tooltip as P;
  }

  return {
    title: tooltip,
  } as P;
}

export default convertToTooltipProps;
