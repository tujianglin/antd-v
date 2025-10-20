import Render from '@/vc-component/render';
import type { VueNode } from '@/vc-util/type';
import { CloseOutlined } from '@ant-design/icons-vue';

export function renderCloseIcon(prefixCls: string, closeIcon?: VueNode | boolean) {
  return (
    <span class={`${prefixCls}-close-x`}>
      {<Render content={closeIcon || <CloseOutlined class={`${prefixCls}-close-icon`} />}></Render>}
    </span>
  );
}
