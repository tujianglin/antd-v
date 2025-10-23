import { reactiveComputed } from '@vueuse/core';
import type { Ref } from 'vue';
import type { TooltipConfig } from '../../config-provider/context';
import type { AbstractTooltipProps } from '../index.vue';

interface MergedArrow {
  show: boolean;
  pointAtCenter?: boolean;
}
const useMergedArrow = (
  providedArrow?: Ref<AbstractTooltipProps['arrow']>,
  providedContextArrow?: Ref<TooltipConfig['arrow']>,
): MergedArrow => {
  const toConfig = (arrow?: boolean | AbstractTooltipProps['arrow']): Partial<MergedArrow> =>
    typeof arrow === 'boolean' ? { show: arrow } : arrow || {};

  return reactiveComputed(() => {
    const arrowConfig = toConfig(providedArrow?.value);
    const contextArrowConfig = toConfig(providedContextArrow?.value);
    return {
      ...contextArrowConfig,
      ...arrowConfig,
      show: arrowConfig.show ?? contextArrowConfig.show ?? true,
    };
  });
};
export default useMergedArrow;
