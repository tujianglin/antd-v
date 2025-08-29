import RefOverflow from './index.vue';
import { INVALIDATE, RESPONSIVE } from './interface';
import RawItem from './RawItem.vue';

type CompoundedComponent = typeof RefOverflow & {
  Item: typeof RawItem;
  RESPONSIVE: typeof RESPONSIVE;
  INVALIDATE: typeof INVALIDATE;
};

const Overflow = RefOverflow as CompoundedComponent;
Overflow.Item = RawItem;
Overflow.RESPONSIVE = RESPONSIVE;
Overflow.INVALIDATE = INVALIDATE;

export default Overflow;
