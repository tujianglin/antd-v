import { Input } from '@/components';
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    return () => (
      <>
        <Input.Search placeholder="input search loading default" loading />
        <br />
        <br />
        <Input.Search placeholder="input search loading with enterButton" loading enterButton />
        <br />
        <br />
        <Input.Search placeholder="input search text" enterButton="Search" size="large" loading />
      </>
    );
  },
});
