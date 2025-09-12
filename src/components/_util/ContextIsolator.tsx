import { defineComponent } from 'vue';
import { NoCompactStyle } from '../space/context';

const ContextIsolator = defineComponent({
  props: {
    space: Boolean,
    form: Boolean,
  },
  setup(props, { slots }) {
    return () => {
      if (props.form) {
        return <NoCompactStyle>{slots.default?.()}</NoCompactStyle>;
      }
      if (props.space) {
        return <NoCompactStyle>{slots.default?.()}</NoCompactStyle>;
      }
      return slots.default?.();
    };
  },
});

export default ContextIsolator;
