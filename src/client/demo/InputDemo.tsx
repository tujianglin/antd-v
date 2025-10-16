import { Flex, Input } from '@/components';
import { defineComponent, effect, ref } from 'vue';

export default defineComponent({
  setup() {
    const value = ref();

    effect(() => {
      console.log('Input', value.value);
    });
    return () => (
      <Flex align="center" gap={8}>
        <div style={{ 'min-width': '100px' }}>输入框</div>
        <Input v-model:value={value.value} />
      </Flex>
    );
  },
});
