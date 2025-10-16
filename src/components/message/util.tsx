import type { CSSMotionProps } from '@/vc-component/motion';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  InfoCircleFilled,
  LoadingOutlined,
} from '@ant-design/icons-vue';

export function getMotion(prefixCls: string, transitionName?: string): CSSMotionProps {
  return {
    motionName: transitionName ?? `${prefixCls}-move-up`,
  };
}

/** Wrap message open with promise like function */
export function wrapPromiseFn(openFn: (resolve: VoidFunction) => VoidFunction) {
  let closeFn: VoidFunction;

  const closePromise = new Promise<boolean>((resolve) => {
    closeFn = openFn(() => {
      resolve(true);
    });
  });

  const result: any = () => {
    closeFn?.();
  };

  result.then = (filled: VoidFunction, rejected: VoidFunction) => closePromise.then(filled, rejected);
  result.promise = closePromise;

  return result;
}

export const TypeIcon = {
  info: <InfoCircleFilled />,
  success: <CheckCircleFilled />,
  error: <CloseCircleFilled />,
  warning: <ExclamationCircleFilled />,
  loading: <LoadingOutlined />,
};
