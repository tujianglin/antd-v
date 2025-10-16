import type { CSSMotionProps } from '@/vc-component/motion';
import type { VueNode } from '@/vc-util/type';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  CloseOutlined,
  ExclamationCircleFilled,
  InfoCircleFilled,
  LoadingOutlined,
} from '@ant-design/icons-vue';
import type { CSSProperties } from 'vue';
import type { NotificationConfig as CPNotificationConfig } from '../config-provider/context';
import type { NotificationConfig, NotificationPlacement } from './interface';

export function getPlacementStyle(placement: NotificationPlacement, top: number, bottom: number) {
  let style: CSSProperties;

  switch (placement) {
    case 'top':
      style = {
        left: '50%',
        transform: 'translateX(-50%)',
        right: 'auto',
        top,
        bottom: 'auto',
      };
      break;

    case 'topLeft':
      style = {
        left: 0,
        top: `${top}px`,
        bottom: 'auto',
      };
      break;

    case 'topRight':
      style = {
        right: 0,
        top: `${top}px`,
        bottom: 'auto',
      };
      break;

    case 'bottom':
      style = {
        left: '50%',
        transform: 'translateX(-50%)',
        right: 'auto',
        top: 'auto',
        bottom: `${bottom}px`,
      };
      break;

    case 'bottomLeft':
      style = {
        left: 0,
        top: 'auto',
        bottom: `${bottom}px`,
      };
      break;

    default:
      style = {
        right: 0,
        top: 'auto',
        bottom: `${bottom}px`,
      };
      break;
  }
  return style;
}

export function getMotion(prefixCls: string): CSSMotionProps {
  return {
    motionName: `${prefixCls}-fade`,
  };
}

export function getCloseIconConfig(
  closeIcon: VueNode,
  notificationConfig?: NotificationConfig,
  notification?: CPNotificationConfig,
) {
  if (typeof closeIcon !== 'undefined') {
    return closeIcon;
  }
  if (typeof notificationConfig?.closeIcon !== 'undefined') {
    return notificationConfig.closeIcon;
  }
  return notification?.closeIcon;
}

export const TypeIcon = {
  info: <InfoCircleFilled />,
  success: <CheckCircleFilled />,
  error: <CloseCircleFilled />,
  warning: <ExclamationCircleFilled />,
  loading: <LoadingOutlined />,
};

export function getCloseIcon(prefixCls: string, closeIcon?: VueNode | boolean): VueNode | boolean {
  if (closeIcon === null || closeIcon === false) {
    return null;
  }
  return closeIcon || <CloseOutlined class={`${prefixCls}-close-icon`} />;
}
