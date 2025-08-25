<script lang="tsx" setup>
import { computed, type CSSProperties } from 'vue';
import type { ImgInfo } from '../Image.vue';
import type { TransformType } from '../hooks/useImageTransform';
import type { Actions, PreviewProps } from './index.vue';
import clsx from 'clsx';
import { Render } from '@/components';
export type FooterSemanticName = 'footer' | 'actions';

type OperationType = 'prev' | 'next' | 'flipY' | 'flipX' | 'rotateLeft' | 'rotateRight' | 'zoomOut' | 'zoomIn';

interface RenderOperationParams {
  icon: any;
  type: OperationType;
  disabled?: boolean;
  onClick: (e: MouseEvent) => void;
}

export interface FooterProps extends Actions {
  prefixCls: string;
  showProgress: boolean;
  countRender?: PreviewProps['countRender'];
  actionsRender?: PreviewProps['actionsRender'];
  current: number;
  count: number;
  showSwitch: boolean;
  icons: PreviewProps['icons'];
  scale: number;
  minScale: number;
  maxScale: number;
  image: ImgInfo;
  transform: TransformType;

  // Style
  classNames: Partial<Record<FooterSemanticName, string>>;
  styles: Partial<Record<FooterSemanticName, CSSProperties>>;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  showProgress,
  current,
  count,
  showSwitch,

  // Style
  classNames,
  styles,

  // render
  icons,
  image,
  transform,
  countRender,
  actionsRender,

  // Scale
  scale,
  minScale,
  maxScale,

  // Actions
  onActive,
  onFlipY,
  onFlipX,
  onRotateLeft,
  onRotateRight,
  onZoomOut,
  onZoomIn,
  onClose,
  onReset,
} = defineProps<FooterProps>();

// ========================== Render ==========================
// >>>>> Progress
const progressNode = () => {
  return (
    showProgress && (
      <div class={`${prefixCls}-progress`}>
        {countRender ? countRender(current + 1, count) : <bdi>{`${current + 1} / ${count}`}</bdi>}
      </div>
    )
  );
};

// >>>>> Actions
const actionCls = computed(() => `${prefixCls}-actions-action`);

const renderOperation = ({ type, disabled, onClick, icon }: RenderOperationParams) => {
  return (
    <div
      key={type}
      class={clsx(actionCls.value, `${actionCls.value}-${type}`, {
        [`${actionCls.value}-disabled`]: !!disabled,
      })}
      onClick={onClick}
    >
      <Render content={icon}></Render>
    </div>
  );
};

const switchPrevNode = () => {
  return showSwitch
    ? renderOperation({
        icon: icons.prev,
        onClick: () => onActive(-1),
        type: 'prev',
        disabled: current === 0,
      })
    : undefined;
};

const switchNextNode = () => {
  return showSwitch
    ? renderOperation({
        icon: icons.next,
        onClick: () => onActive(1),
        type: 'next',
        disabled: current === count - 1,
      })
    : undefined;
};

const flipYNode = () => {
  return renderOperation({
    icon: icons.flipY,
    onClick: onFlipY,
    type: 'flipY',
  });
};

const flipXNode = () => {
  return renderOperation({
    icon: icons.flipX,
    onClick: onFlipX,
    type: 'flipX',
  });
};

const rotateLeftNode = () => {
  return renderOperation({
    icon: icons.rotateLeft,
    onClick: onRotateLeft,
    type: 'rotateLeft',
  });
};

const rotateRightNode = () => {
  return renderOperation({
    icon: icons.rotateRight,
    onClick: onRotateRight,
    type: 'rotateRight',
  });
};

const zoomOutNode = () => {
  return renderOperation({
    icon: icons.zoomOut,
    onClick: onZoomOut,
    type: 'zoomOut',
    disabled: scale <= minScale,
  });
};

const zoomInNode = () => {
  return renderOperation({
    icon: icons.zoomIn,
    onClick: onZoomIn,
    type: 'zoomIn',
    disabled: scale === maxScale,
  });
};

const actionsNode = () => {
  return (
    <div class={clsx(`${prefixCls}-actions`, classNames.actions)} style={styles.actions}>
      {flipYNode()}
      {flipXNode()}
      {rotateLeftNode()}
      {rotateRightNode()}
      {zoomOutNode()}
      {zoomInNode()}
    </div>
  );
};
</script>
<template>
  <div :class="clsx(`${prefixCls}-footer`, classNames.footer)" :style="styles.footer">
    <Render :content="progressNode" />
    <Render
      :content="
        actionsRender
          ? actionsRender(actionsNode, {
              icons: {
                prevIcon: switchPrevNode,
                nextIcon: switchNextNode,
                flipYIcon: flipYNode,
                flipXIcon: flipXNode,
                rotateLeftIcon: rotateLeftNode,
                rotateRightIcon: rotateRightNode,
                zoomOutIcon: zoomOutNode,
                zoomInIcon: zoomInNode,
              },
              actions: {
                onActive,
                onFlipY,
                onFlipX,
                onRotateLeft,
                onRotateRight,
                onZoomOut,
                onZoomIn,
                onReset,
                onClose,
              },
              transform,
              current,
              total: count,
              image,
            })
          : actionsNode
      "
    />
  </div>
</template>
