import isEqual from '@/vc-util/isEqual';
import raf from '@/vc-util/raf';
import { ref, toRaw, type Ref } from 'vue';
import { getClientSize } from '../util';

export type TransformType = {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  flipX: boolean;
  flipY: boolean;
};

export type TransformAction =
  | 'flipY'
  | 'flipX'
  | 'rotateLeft'
  | 'rotateRight'
  | 'zoomIn'
  | 'zoomOut'
  | 'close'
  | 'prev'
  | 'next'
  | 'wheel'
  | 'doubleClick'
  | 'move'
  | 'dragRebound'
  | 'touchZoom'
  | 'reset';

export type UpdateTransformFunc = (newTransform: Partial<TransformType>, action: TransformAction) => void;

export type DispatchZoomChangeFunc = (
  ratio: number,
  action: TransformAction,
  centerX?: number,
  centerY?: number,
  isTouch?: boolean,
) => void;

const initialTransform = {
  x: 0,
  y: 0,
  rotate: 0,
  scale: 1,
  flipX: false,
  flipY: false,
};

export default function useImageTransform(
  imgRef: Ref<HTMLImageElement>,
  minScale: Ref<number>,
  maxScale: Ref<number>,
  onTransform: (info: { transform: TransformType; action: TransformAction }) => void,
) {
  const frame = ref(null);
  const queue = ref<TransformType[]>([]);
  const transform = ref(initialTransform);

  const resetTransform = (action: TransformAction) => {
    transform.value = initialTransform;
    if (!isEqual(initialTransform, toRaw(transform.value))) {
      onTransform?.({ transform: initialTransform, action });
    }
  };

  /** Direct update transform */
  const updateTransform: UpdateTransformFunc = (newTransform, action) => {
    if (frame.value === null) {
      queue.value = [];
      frame.value = raf(() => {
        let memoState: any = transform.value;
        queue.value.forEach((queueState) => {
          memoState = { ...memoState, ...queueState };
        });
        frame.value = null;

        onTransform?.({ transform: memoState, action });
        transform.value = memoState;
      });
    }
    queue.value.push({
      ...transform.value,
      ...newTransform,
    });
  };

  /** Scale according to the position of centerX and centerY */
  const dispatchZoomChange: DispatchZoomChangeFunc = (ratio, action, centerX?, centerY?, isTouch?) => {
    const { width, height, offsetWidth, offsetHeight, offsetLeft, offsetTop } = imgRef.value;

    let newRatio = ratio;
    let newScale = transform.value.scale * ratio;
    if (newScale > maxScale.value) {
      newScale = maxScale.value;
      newRatio = maxScale.value / transform.value.scale;
    } else if (newScale < minScale.value) {
      // For mobile interactions, allow scaling down to the minimum scale.
      newScale = isTouch ? newScale : minScale.value;
      newRatio = newScale / transform.value.scale;
    }

    /** Default center point scaling */
    const mergedCenterX = centerX ?? innerWidth / 2;
    const mergedCenterY = centerY ?? innerHeight / 2;

    const diffRatio = newRatio - 1;
    /** Deviation calculated from image size */
    const diffImgX = diffRatio * width * 0.5;
    const diffImgY = diffRatio * height * 0.5;
    /** The difference between the click position and the edge of the document */
    const diffOffsetLeft = diffRatio * (mergedCenterX - transform.value.x - offsetLeft);
    const diffOffsetTop = diffRatio * (mergedCenterY - transform.value.y - offsetTop);
    /** Final positioning */
    let newX = transform.value.x - (diffOffsetLeft - diffImgX);
    let newY = transform.value.y - (diffOffsetTop - diffImgY);

    /**
     * When zooming the image
     * When the image size is smaller than the width and height of the window, the position is initialized
     */
    if (ratio < 1 && newScale === 1) {
      const mergedWidth = offsetWidth * newScale;
      const mergedHeight = offsetHeight * newScale;
      const { width: clientWidth, height: clientHeight } = getClientSize();
      if (mergedWidth <= clientWidth && mergedHeight <= clientHeight) {
        newX = 0;
        newY = 0;
      }
    }
    updateTransform(
      {
        x: newX,
        y: newY,
        scale: newScale,
      },
      action,
    );
  };

  return {
    transform,
    resetTransform,
    updateTransform,
    dispatchZoomChange,
  };
}
