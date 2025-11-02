import useFormItemStatus from '../hooks/useFormItemStatus';
import InternalFormItem from './index.vue';

export type { FeedbackIcons, FormItemProps, ValidateStatus } from './index.vue';
export type { ItemHolderProps } from './ItemHolder.vue';

type CompoundedComponent = typeof InternalFormItem & {
  useStatus: typeof useFormItemStatus;
};

const FormItem = InternalFormItem as CompoundedComponent;
FormItem.useStatus = useFormItemStatus;

export default FormItem;
