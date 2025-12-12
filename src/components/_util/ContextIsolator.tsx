import { defineComponent } from 'vue';
import { NoFormStyle } from '../form/context';
import { NoCompactStyle } from '../space/context';

const ContextIsolator = defineComponent({
  props: {
    space: Boolean,
    form: Boolean,
  },
  setup(props, { slots }) {
    return () => {
      const { form, space } = props;
      if (form) {
        return (
          <NoFormStyle override status>
            {slots.default?.()}
          </NoFormStyle>
        );
      }
      if (space) {
        return <NoCompactStyle>{slots.default?.()}</NoCompactStyle>;
      }
      return slots.default?.();
    };
  },
});

export default ContextIsolator;
