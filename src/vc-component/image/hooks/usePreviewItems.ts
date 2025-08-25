import { computed, ref, type Ref } from 'vue';
import type { PreviewGroupProps } from '../PreviewGroup.vue';
import { COMMON_PROPS } from '../common';
import type { ImageElementProps, InternalItem, PreviewImageElementProps, RegisterImage } from '../interface';

export type Items = Omit<InternalItem, 'canPreview'>[];

/**
 * Merge props provided `items` or context collected images
 */
export default function usePreviewItems(
  items?: Ref<PreviewGroupProps['items']>,
): [items: Ref<Items>, registerImage: RegisterImage, fromItems: Ref<boolean>] {
  // Context collection image data
  const images = ref<Record<number, PreviewImageElementProps>>({});

  const registerImage = (id, data) => {
    images.value = { ...images.value, [id]: data };

    return () => {
      const cloneImgs = { ...images.value };
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete cloneImgs[id];
      images.value = cloneImgs;
    };
  };

  // items
  const mergedItems = computed<Items>(() => {
    // use `items` first
    if (items.value) {
      return items.value.map((item) => {
        if (typeof item === 'string') {
          return { data: { src: item } };
        }
        const data: ImageElementProps = {};
        Object.keys(item).forEach((key) => {
          if (['src', ...COMMON_PROPS].includes(key)) {
            data[key] = item[key];
          }
        });
        return { data };
      });
    }

    // use registered images secondly
    return Object.keys(images.value).reduce((total: Items, id) => {
      const { canPreview, data } = images.value[id];
      if (canPreview) {
        total.push({ data, id });
      }
      return total;
    }, []);
  });

  return [mergedItems, registerImage, computed(() => !!items.value)];
}
