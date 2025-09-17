<script lang="tsx">
import { ConfigProvider, Flex, Rate, Space } from '@/components';
import { defineComponent } from 'vue';
import zhCN from '@/components/locale/zh_CN';
import 'dayjs/locale/zh-cn';
import { HeartOutlined } from '@ant-design/icons-vue';

export default defineComponent({
  setup() {
    return () => (
      <div style={{ margin: '100px' }}>
        <ConfigProvider locale={zhCN}>
          <Flex vertical gap="small">
            <Space vertical size={12}>
              <Rate character={<HeartOutlined />} allowHalf />
              <Rate character="A" allowHalf style={{ fontSize: '36px' }} />
              <Rate character="好" allowHalf />
            </Space>
          </Flex>
        </ConfigProvider>
      </div>
    );
  },
});
</script>

<style lang="less">
@import '@/vc-component/mentions/assets/index.less';
</style>
