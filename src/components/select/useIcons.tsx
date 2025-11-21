import Render from '@/vc-component/render';
import type { VueNode } from '@/vc-util/type';
import {
  CheckOutlined,
  CloseCircleFilled,
  CloseOutlined,
  DownOutlined,
  LoadingOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue';
import type { ReactiveComputedReturn } from '@vueuse/core';
import { computed, toRefs } from 'vue';

export default function useIcons(
  options: ReactiveComputedReturn<{
    suffix?: VueNode;
    clearIcon?: VueNode;
    menuItemSelectedIcon?: VueNode;
    removeIcon?: VueNode;
    loading?: boolean;
    multiple?: boolean;
    hasFeedback?: boolean;
    feedbackIcon?: VueNode;
    prefixCls: string;
    showSuffixIcon?: boolean;
    showArrow?: boolean;
    componentName: string;
  }>,
): any {
  const {
    suffix,
    clearIcon,
    menuItemSelectedIcon,
    removeIcon,
    loading,
    multiple,
    hasFeedback,
    prefixCls,
    feedbackIcon,
    showArrow,
    showSuffixIcon,
  } = toRefs(options);
  // Clear Icon
  const mergedClearIcon = computed(() => clearIcon?.value ?? <CloseCircleFilled />);

  // Validation Feedback Icon
  const getSuffixIconNode = (arrowIcon?: VueNode) => {
    if (!suffix?.value && !hasFeedback?.value && showArrow?.value === false) {
      return null;
    }
    return (
      <>
        {showSuffixIcon?.value !== false && <Render content={arrowIcon}></Render>}
        {hasFeedback?.value && <Render content={feedbackIcon?.value}></Render>}
      </>
    );
  };

  // Arrow item icon
  const mergedSuffixIcon = computed(() => {
    return ({ open, showSearch }: { open: boolean; showSearch: boolean }) => {
      if (suffix.value !== undefined) {
        return getSuffixIconNode(suffix.value);
      }

      if (loading.value) {
        return getSuffixIconNode(() => <LoadingOutlined spin />);
      }

      const iconCls = `${prefixCls.value}-suffix`;
      if (open && showSearch) {
        return getSuffixIconNode(() => <SearchOutlined class={iconCls} />);
      }
      return getSuffixIconNode(() => <DownOutlined class={iconCls} />);
    };
  });

  // Checked item icon
  const mergedItemIcon = computed(() => {
    let result = null;
    if (menuItemSelectedIcon.value !== undefined) {
      result = menuItemSelectedIcon.value;
    } else if (multiple.value) {
      result = <CheckOutlined />;
    } else {
      result = null;
    }
    return result;
  });

  const mergedRemoveIcon = computed(() => {
    let result = null;
    if (removeIcon.value !== undefined) {
      result = removeIcon.value;
    } else {
      result = <CloseOutlined />;
    }
    return result;
  });

  return {
    clearIcon: mergedClearIcon,
    suffixIcon: mergedSuffixIcon,
    itemIcon: mergedItemIcon,
    removeIcon: mergedRemoveIcon,
  } as const;
}
