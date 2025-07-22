import { isArray, isBoolean } from 'lodash-es';
import { cloneVNode, defineComponent, h, isVNode, type PropType } from 'vue';
import { isComponent, type RenderNode } from '../_util/type';

export default defineComponent({
  inheritAttrs: false,
  name: 'RenderContent',
  props: {
    content: {
      type: [Object, Boolean, String, Number, Function] as PropType<RenderNode>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    return () => {
      if (isBoolean(props.content)) {
        return null;
      }
      if (isComponent(props.content) && !isArray(props.content)) {
        return h(props.content as never, { ...attrs }, slots);
      }
      if (isVNode(props.content)) {
        return cloneVNode(props.content, { ...attrs });
      }
      return <>{props.content}</>;
    };
  },
});
