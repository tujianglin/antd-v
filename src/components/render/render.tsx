import type { VueNode } from '@/vc-util/type';
import { isArray, isBoolean } from 'lodash-es';
import { cloneVNode, defineComponent, h, isVNode, type Component, type PropType } from 'vue';
import { isComponent } from '../_util/type';

export default defineComponent({
  inheritAttrs: false,
  name: 'Render',
  props: {
    content: {
      type: [Object, Boolean, String, Number, Function] as PropType<VueNode>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    return () => {
      if (isBoolean(props.content)) {
        return null;
      }
      if (isComponent(props.content) && !isArray(props.content)) {
        return h(props.content as Component, { ...attrs }, slots);
      }
      if (isVNode(props.content)) {
        return cloneVNode(props.content, { ...attrs });
      }
      return <>{props.content}</>;
    };
  },
});
