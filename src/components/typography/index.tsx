import Link from './Link.vue';
import Paragraph from './Paragraph.vue';
import Text from './Text.vue';
import Title from './Title.vue';
import OriginTypography from './Typography.vue';

export type TypographyProps = typeof OriginTypography & {
  Text: typeof Text;
  Link: typeof Link;
  Title: typeof Title;
  Paragraph: typeof Paragraph;
};

const Typography = OriginTypography as TypographyProps;
Typography.Text = Text;
Typography.Link = Link;
Typography.Title = Title;
Typography.Paragraph = Paragraph;

export default Typography;
