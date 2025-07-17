import { defineComponent } from 'vue';
import { NoCompactStyle } from '../space/context';

const ContextIsolator = defineComponent({
  props: {
    space: Boolean,
  },
  setup(props, { slots }) {
    return () => <>{props.space ? <NoCompactStyle>{slots.default?.()}</NoCompactStyle> : <>{slots.default?.()}</>}</>;
  },
});

export default ContextIsolator;
