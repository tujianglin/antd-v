import { computed, toRefs, type CSSProperties, type Ref } from 'vue';
import { useMenuContextInject } from '../context/MenuContext';

export default function useDirectionStyle(level: Ref<number>): Ref<CSSProperties> {
  const { mode, rtl, inlineIndent } = toRefs(useMenuContextInject());

  return computed(() => {
    if (mode?.value !== 'inline') {
      return null;
    }

    const len = level.value;
    return rtl.value ? { paddingRight: `${len * inlineIndent?.value}px` } : { paddingLeft: `${len * inlineIndent?.value}px` };
  });
}
