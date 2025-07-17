import type { BaseInputProps } from '@/vc-component/input/interface';
import { CloseCircleFilled } from '@ant-design/icons-vue';

export type AllowClear = BaseInputProps['allowClear'];

const getAllowClear = (allowClear: AllowClear): AllowClear => {
  let mergedAllowClear: AllowClear;
  if (typeof allowClear === 'object' && allowClear?.clearIcon) {
    mergedAllowClear = allowClear;
  } else if (allowClear) {
    mergedAllowClear = {
      clearIcon: <CloseCircleFilled />,
    };
  }

  return mergedAllowClear;
};

export default getAllowClear;
