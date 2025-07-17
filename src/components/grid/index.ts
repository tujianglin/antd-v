import Col from './col.vue';
import useInternalBreakpoint from './hooks/useBreakpoint';
import Row from './row.vue';
function useBreakpoint() {
  return useInternalBreakpoint();
}
export type { ColProps, ColSize } from './col.vue';
export type { RowProps } from './row.vue';
export { Col, Row };

export default { useBreakpoint };
