import {
  CloseOutlined,
  LeftOutlined,
  RightOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SwapOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons-vue';

export const icons = {
  rotateLeft: <RotateLeftOutlined />,
  rotateRight: <RotateRightOutlined />,
  zoomIn: <ZoomInOutlined />,
  zoomOut: <ZoomOutOutlined />,
  close: <CloseOutlined />,
  prev: <LeftOutlined />,
  next: <RightOutlined />,
  flipX: <SwapOutlined />,
  _flipY: <SwapOutlined rotate={90} />,
  get flipY() {
    return this._flipY;
  },
  set flipY(value) {
    this._flipY = value;
  },
};
