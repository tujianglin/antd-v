import { Flex, Radio } from '@/components';
import { defineComponent, effect, ref } from 'vue';

export default defineComponent({
  setup() {
    const value = ref();

    effect(() => {
      console.log('Radio', value.value);
    });
    return () => (
      <Flex align="center" gap={8}>
        <div style={{ width: '100px' }}>单选框</div>
        <Radio v-model:checked={value.value}>Radio</Radio>
      </Flex>
    );
  },
});
