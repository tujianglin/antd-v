import { toRefs } from 'vue';
import { useFormContextInject } from '../context';

export default function useFormInstance() {
  const { form } = toRefs(useFormContextInject());

  return form;
}
