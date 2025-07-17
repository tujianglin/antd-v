import { defineComponent, h, type Component, type PropType, type VNode } from 'vue';
import { isComponent } from '../_util/type';

export default defineComponent({
  inheritAttrs: false,
  name: 'RenderContent',
  props: {
    content: {
      default: undefined as PropType<(() => any) | Component | VNode | string | number> | undefined,
      type: [Object, String, Function, Number],
    },
  },
  setup(props, { attrs, slots }) {
    return () => {
      if (isComponent(props.content)) {
        return h(props.content as never, { ...props, ...attrs }, slots);
      }
      return <>{props.content}</>;
    };
  },
});
