import { isFunction, isObject } from 'lodash-es';
import { defineComponent, h, type Component, type PropType } from 'vue';

export default defineComponent({
  name: 'RenderContent',
  props: {
    content: {
      default: undefined as PropType<(() => any) | Component | string> | undefined,
      type: [Object, String, Function],
    },
  },
  setup(props, { attrs, slots }) {
    return () => {
      if (!props.content) {
        return null;
      }
      const isComponent = (isObject(props.content) || isFunction(props.content)) && props.content !== null;
      if (!isComponent) {
        return props.content;
      }
      return h(props.content as never, {
        ...attrs,
        props: {
          ...props,
          ...attrs,
        },
        slots,
      });
    };
  },
});
