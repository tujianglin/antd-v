import InternalAnchor from './Anchor.vue';
import AnchorLink from './AnchorLink.vue';

export type { AnchorProps } from './Anchor.vue';
export type { AnchorLinkProps } from './AnchorLink.vue';

type InternalAnchorType = typeof InternalAnchor;

type CompoundedComponent = InternalAnchorType & {
  Link: typeof AnchorLink;
};

const Anchor = InternalAnchor as CompoundedComponent;

Anchor.Link = AnchorLink;
export default Anchor;
