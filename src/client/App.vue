<script lang="tsx">
import { ConfigProvider, Flex, Space } from '@/components';
import { defineComponent } from 'vue';
import zhCN from '@/components/locale/zh_CN';
import 'dayjs/locale/zh-cn';
import ColorPickerDemo from './demo/ColorPickerDemo';

export default defineComponent({
  setup() {
    return () => (
      <div style={{ margin: '100px' }}>
        <ConfigProvider locale={zhCN}>
          <Flex vertical gap="small">
            <Space vertical size={12}>
              <ColorPickerDemo></ColorPickerDemo>
            </Space>
          </Flex>
        </ConfigProvider>
      </div>
    );
  },
});
</script>

<style lang="less">
@import '@/vc-component/cascader/assets/index.less';
</style>
