import InternalCard from './Card.vue';
import Grid from './Grid.vue';
import Meta from './Meta.vue';

export type { CardProps, CardTabListType } from './Card.vue';
export type { CardGridProps } from './Grid.vue';
export type { CardMetaProps } from './Meta.vue';

type InternalCardType = typeof InternalCard;

export interface CardInterface extends InternalCardType {
  Grid: typeof Grid;
  Meta: typeof Meta;
}

const Card = InternalCard as CardInterface;

Card.Grid = Grid;
Card.Meta = Meta;

export default Card;
