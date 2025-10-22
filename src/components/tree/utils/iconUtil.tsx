import { cloneElement, isValidElement } from '@/vc-util/Children/util';
import type { VueNode } from '@/vc-util/type';
import { CaretDownFilled, FileOutlined, LoadingOutlined, MinusSquareOutlined, PlusSquareOutlined } from '@ant-design/icons-vue';
import clsx from 'clsx';
import type { AntTreeNodeProps, SwitcherIcon, TreeLeafIcon } from '../Tree.vue';

interface SwitcherIconProps {
  prefixCls: string;
  treeNodeProps: AntTreeNodeProps;
  switcherIcon?: SwitcherIcon;
  switcherLoadingIcon?: VueNode;
  showLine?: boolean | { showLeafIcon: boolean | TreeLeafIcon };
}

const SwitcherIconCom = (props: SwitcherIconProps) => {
  const { prefixCls, switcherIcon, treeNodeProps, showLine, switcherLoadingIcon } = props;

  const { isLeaf, expanded, loading } = treeNodeProps;

  if (loading) {
    if (isValidElement(switcherLoadingIcon)) {
      return switcherLoadingIcon;
    }
    return <LoadingOutlined class={`${prefixCls}-switcher-loading-icon`} />;
  }
  let showLeafIcon: boolean | TreeLeafIcon;
  if (showLine && typeof showLine === 'object') {
    showLeafIcon = showLine.showLeafIcon;
  }

  if (isLeaf) {
    if (!showLine) {
      return null;
    }

    if (typeof showLeafIcon !== 'boolean' && !!showLeafIcon) {
      const leafIcon = typeof showLeafIcon === 'function' ? (showLeafIcon as any)(treeNodeProps) : showLeafIcon;
      const leafCls = `${prefixCls}-switcher-line-custom-icon`;

      if (isValidElement(leafIcon)) {
        return cloneElement(leafIcon, {
          class: clsx(leafIcon.props?.class, leafCls),
        });
      }

      return leafIcon;
    }

    return showLeafIcon ? (
      <FileOutlined class={`${prefixCls}-switcher-line-icon`} />
    ) : (
      <span class={`${prefixCls}-switcher-leaf-line`} />
    );
  }

  const switcherCls = `${prefixCls}-switcher-icon`;

  const switcher = typeof switcherIcon === 'function' ? (switcherIcon as any)(treeNodeProps) : switcherIcon;

  if (isValidElement(switcher)) {
    return cloneElement(switcher, {
      class: clsx(switcher.props?.class, switcherCls),
    });
  }

  if (switcher !== undefined) {
    return switcher;
  }

  if (showLine) {
    return expanded ? (
      <MinusSquareOutlined class={`${prefixCls}-switcher-line-icon`} />
    ) : (
      <PlusSquareOutlined class={`${prefixCls}-switcher-line-icon`} />
    );
  }
  return <CaretDownFilled class={switcherCls} />;
};

export default SwitcherIconCom;
