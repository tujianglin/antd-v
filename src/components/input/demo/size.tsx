import { Input } from '@/components';
import { UserOutlined } from '@ant-design/icons-vue';
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    return () => (
      <>
        <Input size="large" placeholder="large size" prefix={<UserOutlined />} />
        <br />
        <br />
        <Input placeholder="default size" prefix={<UserOutlined />} />
        <br />
        <br />
        <Input size="small" placeholder="small size" prefix={<UserOutlined />} />
      </>
    );
  },
});
