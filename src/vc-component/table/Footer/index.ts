import Cell from './Cell.vue';
import Footer from './index.vue';
import Row from './Row.vue';
import InnerSummary from './Summary.vue';

type InnerSummaryType = typeof InnerSummary & {
  Row: typeof Row;
  Cell: typeof Cell;
};

const Summary = InnerSummary as InnerSummaryType;
Summary.Row = Row;
Summary.Cell = Cell;

export const FooterComponents = Summary;

export default Footer;
