import useToken from '@/components/theme/useToken';
import { computed, type ComputedRef, type Ref } from 'vue';
import { useZIndexContextInject } from '../zindexContext';

export type ZIndexContainer = 'Modal' | 'Drawer' | 'Popover' | 'Popconfirm' | 'Tooltip' | 'Tour' | 'FloatButton';

export type ZIndexConsumer = 'SelectLike' | 'Dropdown' | 'DatePicker' | 'Menu' | 'ImagePreview';

// Z-Index control range
// Container: 1000 + offset 100 (max base + 10 * offset = 2000)
// Popover: offset 50
// Notification: Container Max zIndex + componentOffset

const CONTAINER_OFFSET = 100;
const CONTAINER_OFFSET_MAX_COUNT = 10;

export const CONTAINER_MAX_OFFSET = CONTAINER_OFFSET * CONTAINER_OFFSET_MAX_COUNT;

export const containerBaseZIndexOffset: Record<ZIndexContainer, number> = {
  Modal: CONTAINER_OFFSET,
  Drawer: CONTAINER_OFFSET,
  Popover: CONTAINER_OFFSET,
  Popconfirm: CONTAINER_OFFSET,
  Tooltip: CONTAINER_OFFSET,
  Tour: CONTAINER_OFFSET,
  FloatButton: CONTAINER_OFFSET,
};

export const consumerBaseZIndexOffset: Record<ZIndexConsumer, number> = {
  SelectLike: 50,
  Dropdown: 50,
  DatePicker: 50,
  Menu: 50,
  ImagePreview: 1,
};

function isContainerType(type: ZIndexContainer | ZIndexConsumer): type is ZIndexContainer {
  return type in containerBaseZIndexOffset;
}

type ReturnResult = [zIndex: ComputedRef<number | undefined>, contextZIndex: ComputedRef<number>];

export const useZIndex = (componentType: ZIndexContainer | ZIndexConsumer, customZIndex?: Ref<number>): ReturnResult => {
  const [, token] = useToken();
  const parentZIndex = useZIndexContextInject();
  const isContainer = isContainerType(componentType);

  const zIndex = computed(() => {
    let result;

    if (customZIndex?.value !== undefined) {
      result = [customZIndex.value, customZIndex.value];
    } else {
      let zIndex = parentZIndex.value ?? 0;

      if (isContainer) {
        zIndex +=
          // Use preset token zIndex by default but not stack when has parent container
          (parentZIndex.value ? 0 : token.value.zIndexPopupBase) +
          // Container offset
          containerBaseZIndexOffset[componentType];
      } else {
        zIndex += consumerBaseZIndexOffset[componentType];
      }
      result = [parentZIndex.value === undefined ? customZIndex?.value : zIndex, zIndex];
    }
    return result;
  });

  return [computed(() => zIndex.value[0]), computed(() => zIndex.value[1])];
};
