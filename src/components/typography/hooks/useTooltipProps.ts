import { isValidElement } from '@/vc-util/Children/util';
import type { VueNode } from '@/vc-util/type';
import { computed, type Ref } from 'vue';
import type { TooltipProps } from '../../tooltip';

const useTooltipProps = (tooltip: Ref<VueNode | boolean | TooltipProps>, editConfigText: Ref<VueNode>, children: Ref<VueNode>) =>
  computed<any>(() => {
    if (tooltip.value === true) {
      return { title: editConfigText.value ?? children.value };
    }
    if (isValidElement(tooltip.value)) {
      return { title: tooltip.value };
    }
    if (typeof tooltip.value === 'object') {
      return { title: editConfigText.value ?? children.value, ...tooltip.value };
    }
    return { title: tooltip.value };
  });

export default useTooltipProps;
