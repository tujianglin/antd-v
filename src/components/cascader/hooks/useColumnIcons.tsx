import type { VueNode } from '@/vc-util/type';
import { LeftOutlined, LoadingOutlined, RightOutlined } from '@ant-design/icons-vue';
import { computed, type Ref } from 'vue';

const useColumnIcons = (prefixCls: Ref<string>, rtl: Ref<boolean>, expandIcon?: Ref<VueNode>) => {
  const mergedExpandIcon = computed(() => {
    let result = expandIcon?.value;
    if (!expandIcon?.value) {
      result = rtl.value ? <LeftOutlined /> : <RightOutlined />;
    }
    return result;
  });

  const loadingIcon = computed(() => (
    <span class={`${prefixCls.value}-menu-item-loading-icon`}>
      <LoadingOutlined spin />
    </span>
  ));

  return [mergedExpandIcon, loadingIcon];
};

export default useColumnIcons;
