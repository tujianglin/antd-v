import type { TableProps } from '@/vc-component/table';
import type { Ref } from 'vue';

export default function useContainerWidth(prefixCls: Ref<string>) {
  const getContainerWidth: TableProps['getContainerWidth'] = (ele, width) => {
    const container = ele.querySelector(`.${prefixCls.value}-container`);
    let returnWidth = width;

    if (container) {
      const style = getComputedStyle(container);
      const borderLeft = Number.parseInt(style.borderLeftWidth, 10);
      const borderRight = Number.parseInt(style.borderRightWidth, 10);
      returnWidth = width - borderLeft - borderRight;
    }

    return returnWidth;
  };

  return getContainerWidth;
}
