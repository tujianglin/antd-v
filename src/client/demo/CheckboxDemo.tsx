import { Checkbox, Flex } from '@/components';
import { defineComponent, effect, ref } from 'vue';

export default defineComponent({
  setup() {
    const value = ref();

    effect(() => {
      console.log('Checkbox', value.value);
    });
    return () => (
      <Flex align="center" gap={8}>
        <div style={{ width: '100px' }}>多选框</div>
        <Checkbox v-model:checked={value.value}>Checkbox</Checkbox>
      </Flex>
    );
  },
});
