import type { ImgHTMLAttributes } from 'vue';

/**
 * Used for PreviewGroup passed image data
 */
export type ImageElementProps = Pick<
  ImgHTMLAttributes,
  'src' | 'crossorigin' | 'decoding' | 'draggable' | 'loading' | 'referrerpolicy' | 'sizes' | 'srcset' | 'usemap' | 'alt'
>;

export type PreviewImageElementProps = {
  data: ImageElementProps;
  canPreview: boolean;
};

export type InternalItem = PreviewImageElementProps & {
  id?: string;
};

export type RegisterImage = (id: string, data: PreviewImageElementProps) => VoidFunction;

export type OnGroupPreview = (id: string, imageSrc: string, mouseX: number, mouseY: number) => void;
