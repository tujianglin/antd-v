import InternalDescriptions from './index.vue';
import Item from './Item.vue';

export type { DescriptionsProps } from './index.vue';

const Descriptions = InternalDescriptions as typeof InternalDescriptions & {
  Item: typeof Item;
};

Descriptions.Item = Item;

export default Descriptions;
