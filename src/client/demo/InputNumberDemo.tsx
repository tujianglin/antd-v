import { Flex, InputNumber } from '@/components';
import { defineComponent, effect, ref } from 'vue';

export default defineComponent({
  setup() {
    const value = ref();

    effect(() => {
      console.log('InputNumber', value.value);
    });
    return () => (
      <Flex align="center" gap={8}>
        <div style={{ 'min-width': '100px' }}>数字输入框</div>
        <InputNumber min={1} max={10} v-model:value={value.value} />
      </Flex>
    );
  },
});
