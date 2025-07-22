import { Button, Input, Space } from '@/components';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons-vue';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  setup() {
    const passwordVisible = ref(false);
    return () => (
      <Space vertical>
        <Input.Password placeholder="input password" />
        <Input.Password
          placeholder="input password"
          iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
        />
        <Space>
          <Input.Password
            placeholder="input password"
            visibilityToggle={{ visible: passwordVisible.value, onVisibleChange: (val) => (passwordVisible.value = val) }}
          />
          <Button style={{ width: 80 }} onClick={() => (passwordVisible.value = !passwordVisible.value)}>
            {passwordVisible ? 'Hide' : 'Show'}
          </Button>
        </Space>
        <Input.Password disabled placeholder="disabled input password" />
      </Space>
    );
  },
});
