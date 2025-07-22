import { Input, Space } from '@/components';
import { SettingOutlined } from '@ant-design/icons-vue';
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    return () => (
      <Space vertical>
        <Input addonBefore="http://" addonAfter=".com" value="mysite" />
        {/* <Input addonBefore={selectBefore} addonAfter={selectAfter} value="mysite" /> */}
        <Input addonAfter={<SettingOutlined />} value="mysite" />
        <Input addonBefore="http://" suffix=".com" value="mysite" />
        {/* <Input addonBefore={<Cascader placeholder="cascader" style={{ width: 150 }} />} value="mysite" /> */}
      </Space>
    );
  },
});
