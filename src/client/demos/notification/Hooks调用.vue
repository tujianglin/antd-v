<script lang="tsx">
import { Button, Divider, notification, Space } from '@/components';
import {
  RadiusBottomleftOutlined,
  RadiusBottomrightOutlined,
  RadiusUpleftOutlined,
  RadiusUprightOutlined,
} from '@ant-design/icons-vue';
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    const [api, ContextHolder] = notification.useNotification();

    const openNotification = (placement) => {
      api.info({
        title: `Notification ${placement}`,
        description: '11111111111',
        placement,
      });
    };
    return () => (
      <>
        <ContextHolder></ContextHolder>
        <Space>
          <Button type="primary" onClick={() => openNotification('topLeft')} icon={<RadiusUpleftOutlined />}>
            topLeft
          </Button>
          <Button type="primary" onClick={() => openNotification('topRight')} icon={<RadiusUprightOutlined />}>
            topRight
          </Button>
        </Space>
        <Divider />
        <Space>
          <Button type="primary" onClick={() => openNotification('bottomLeft')} icon={<RadiusBottomleftOutlined />}>
            bottomLeft
          </Button>
          <Button type="primary" onClick={() => openNotification('bottomRight')} icon={<RadiusBottomrightOutlined />}>
            bottomRight
          </Button>
        </Space>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
