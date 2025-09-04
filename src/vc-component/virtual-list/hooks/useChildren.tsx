import type { VNode } from 'vue';
import type { RenderFunc, SharedConfig } from '../interface';
import Item from '../Item.vue';

export default function useChildren<T>(
  list: T[],
  startIndex: number,
  endIndex: number,
  scrollWidth: number,
  offsetX: number,
  setNodeRef: (item: T, element: HTMLElement) => void,
  renderFunc: RenderFunc<T>,
  { getKey }: SharedConfig<T>,
) {
  return list.slice(startIndex, endIndex + 1).map((item, index) => {
    const eleIndex = startIndex + index;
    const node = renderFunc({
      item,
      index: eleIndex,
      props: {
        style: {
          width: scrollWidth ? `${scrollWidth}px` : undefined,
        },
        offsetX,
      },
    }) as VNode;

    const key = getKey(item);
    return (
      <Item key={key} ref={(el: any) => setNodeRef(item, el?.el)}>
        {node}
      </Item>
    );
  });
}
