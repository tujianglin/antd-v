import { computed, type Ref } from 'vue';

/**
 * This hook is only for cssVar to add root className for components.
 * If root ClassName is needed, this hook could be refactored with `-root`
 * @param prefixCls
 */
const useCSSVarCls = (prefixCls: Ref<string>) => computed(() => `${prefixCls.value}-css-var`);

export default useCSSVarCls;
