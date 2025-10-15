import { computed, type ComputedRef, type Ref } from 'vue';
import { useConfigContextInject, type DirectionType, type RenderEmptyHandler } from '../../config-provider';

function useBase(
  customizePrefixCls?: Ref<string>,
  direction?: Ref<DirectionType>,
): [
  prefixCls: ComputedRef<string>,
  cascaderPrefixCls: ComputedRef<string>,
  direction?: ComputedRef<DirectionType>,
  renderEmpty?: ComputedRef<RenderEmptyHandler>,
] {
  const configContext = useConfigContextInject();

  const mergedDirection = computed(() => direction.value || configContext.direction);

  const prefixCls = computed(() => configContext.getPrefixCls('select', customizePrefixCls.value));
  const cascaderPrefixCls = computed(() => configContext.getPrefixCls('cascader', customizePrefixCls.value));

  return [prefixCls, cascaderPrefixCls, mergedDirection, computed(() => configContext.renderEmpty)];
}

export default useBase;
