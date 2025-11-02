import { toRefs } from 'vue';
import { devUseWarning } from '../../_util/warning';
import { useFormItemInputContextInject } from '../context';

const useFormItemStatus = (): any => {
  const { status, errors = [], warnings = [] } = toRefs(useFormItemInputContextInject());

  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Form.Item');

    warning(
      status !== undefined,
      'usage',
      'Form.Item.useStatus should be used under Form.Item component. For more information: https://u.ant.design/form-item-usestatus',
    );
  }

  return { status, errors, warnings } as const;
};

// Only used for compatible package. Not promise this will work on future version.
// (useFormItemStatus as any).Context = FormItemInputContext;

export default useFormItemStatus;
