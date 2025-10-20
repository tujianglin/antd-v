import { shallowRef, type CSSProperties, type Ref } from 'vue';
import { getStyleStr } from './utils';

/**
 * Base size of the canvas, 1 for parallel layout and 2 for alternate layout
 * Only alternate layout is currently supported
 */
export const BaseSize = 2;
export const FontGap = 3;

// Prevent external hidden elements from adding accent styles
const emphasizedStyle: CSSProperties = {
  visibility: 'visible !important',
} as unknown as CSSProperties;

export type AppendWatermark = (base64Url: string, markWidth: number, container: HTMLElement) => void;

export default function useWatermark(
  markStyle: Ref<CSSProperties>,
): [appendWatermark: AppendWatermark, removeWatermark: (container: HTMLElement) => void, isWatermarkEle: (ele: Node) => boolean] {
  const watermarkMap = shallowRef(new Map<HTMLElement, HTMLDivElement>());

  const appendWatermark = (base64Url: string, markWidth: number, container: HTMLElement) => {
    if (container) {
      if (!watermarkMap.value.get(container)) {
        const newWatermarkEle = document.createElement('div');
        watermarkMap.value.set(container, newWatermarkEle);
      }

      const watermarkEle = watermarkMap.value.get(container)!;

      watermarkEle.setAttribute(
        'style',
        getStyleStr({
          ...markStyle?.value,
          backgroundImage: `url('${base64Url}')`,
          backgroundSize: `${Math.floor(markWidth)}px`,
          ...emphasizedStyle,
        }),
      );
      // Prevents using the browser `Hide Element` to hide watermarks
      watermarkEle.removeAttribute('class');
      watermarkEle.removeAttribute('hidden');

      if (watermarkEle.parentElement !== container) {
        container.append(watermarkEle);
      }
    }

    return watermarkMap.value.get(container);
  };

  const removeWatermark = (container: HTMLElement) => {
    const watermarkEle = watermarkMap.value.get(container);

    if (watermarkEle && container) {
      container.removeChild(watermarkEle);
    }

    watermarkMap.value.delete(container);
  };

  const isWatermarkEle = (ele: any) => Array.from(watermarkMap.value.values()).includes(ele);

  return [appendWatermark, removeWatermark, isWatermarkEle];
}
