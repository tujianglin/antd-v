import { Flex, Input } from '@/components';
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    return () => (
      <Flex vertical gap={12}>
        <Input placeholder="Outlined" />
        <Input placeholder="Filled" variant="filled" />
        <Input placeholder="Borderless" variant="borderless" />
        <Input placeholder="Underlined" variant="underlined" />
        <Input.Search placeholder="Filled" variant="filled" />
      </Flex>
    );
  },
});
