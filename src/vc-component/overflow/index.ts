import RefOverflow from './index.vue';
import RawItem from './RawItem.vue';

type CompoundedComponent = typeof RefOverflow & {
  Item: typeof RawItem;
};

const Overflow = RefOverflow as CompoundedComponent;
Overflow.Item = RawItem;

export default Overflow;
