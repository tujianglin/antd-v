import Content from './Content.vue';
import Footer from './Footer.vue';
import Header from './Header.vue';
import InternalLayout from './Layout.vue';
import Sider from './Sider.vue';

export type { BasicProps as LayoutProps } from './Layout.vue';
export type { SiderProps } from './Sider.vue';

type InternalLayoutType = typeof InternalLayout;

type CompoundedComponent = InternalLayoutType & {
  Header: typeof Header;
  Footer: typeof Footer;
  Content: typeof Content;
  Sider: typeof Sider;
};

const Layout = InternalLayout as CompoundedComponent;

Layout.Header = Header;
Layout.Footer = Footer;
Layout.Content = Content;
Layout.Sider = Sider;

export default Layout;
