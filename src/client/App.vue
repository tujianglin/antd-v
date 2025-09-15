<script lang="tsx">
import { Menu, type MenuProps } from '@/components';
import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons-vue';
import RcMenu from '@/vc-component/menu';
import { defineComponent, ref } from 'vue';
import type { CSSMotionProps } from '@/vc-component/motion';

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
  {
    label: 'Navigation One',
    key: 'mail',
    icon: <MailOutlined />,
  },
  {
    label: 'Navigation Two',
    key: 'app',
    icon: <AppstoreOutlined />,
    disabled: true,
  },
  {
    label: 'Navigation Three - Submenu',
    key: 'SubMenu',
    icon: <SettingOutlined />,
    children: [
      {
        type: 'group',
        label: 'Item 1',
        children: [
          { label: 'Option 1', key: 'setting:1' },
          { label: 'Option 2', key: 'setting:2' },
        ],
      },
      {
        type: 'group',
        label: 'Item 2',
        children: [
          { label: 'Option 3', key: 'setting:3' },
          { label: 'Option 4', key: 'setting:4' },
        ],
      },
    ],
  },
  {
    key: 'alipay',
    label: (
      <a href="https://ant.design" target="_blank" rel="noopener noreferrer">
        Navigation Four - Link
      </a>
    ),
  },
];

const collapseNode = () => {
  return { height: 0 };
};
const expandNode = (node) => {
  return { height: node.scrollHeight };
};

const horizontalMotion: CSSMotionProps = {
  motionName: 'rc-menu-open-slide-up',
  motionAppear: true,
  motionEnter: true,
  motionLeave: true,
};

const verticalMotion: CSSMotionProps = {
  motionName: 'rc-menu-open-zoom',
  motionAppear: true,
  motionEnter: true,
  motionLeave: true,
};

export const inlineMotion: CSSMotionProps = {
  motionName: 'rc-menu-collapse',
  motionAppear: true,
  onAppearStart: collapseNode,
  onAppearActive: expandNode,
  onEnterStart: collapseNode,
  onEnterActive: expandNode,
  onLeaveStart: expandNode,
  onLeaveActive: collapseNode,
};

const motionMap: Record<MenuProps['mode'], CSSMotionProps> = {
  horizontal: horizontalMotion,
  inline: inlineMotion,
  vertical: verticalMotion,
};
export default defineComponent({
  setup() {
    const current = ref('mail');

    const onClick: MenuProps['onClick'] = (e) => {
      console.log('click ', e);
      current.value = e.key;
    };
    return () => (
      <div style={{ margin: '100px' }}>
        <Menu onClick={onClick} selectedKeys={[current.value]} mode="horizontal" items={items} />
        <RcMenu
          mode="horizontal"
          defaultMotions={motionMap}
          onOpenChange={(e) => {
            console.log(e);
          }}
          items={items}
        ></RcMenu>
      </div>
    );
  },
});
</script>
<style lang="less">
@import '@/vc-component/menu/assets/index.less';
</style>
