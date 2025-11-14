import { isComponent } from '@/vc-util/Children/util';
import type { VueNode } from '@/vc-util/type';
import { isArray, isBoolean } from 'es-toolkit/compat';
import { cloneVNode, defineComponent, getCurrentInstance, h, isVNode, type Component, type PropType } from 'vue';

export default defineComponent({
  inheritAttrs: false,
  name: 'Render',
  props: {
    content: {
      type: [Object, Boolean, String, Number, Function] as PropType<VueNode>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots, expose }) {
    const vm = getCurrentInstance();
    expose({
      get el() {
        return vm.exposed;
      },
    });
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
