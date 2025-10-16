import { Flex, Rate } from '@/components';
import { defineComponent, effect, ref } from 'vue';

export default defineComponent({
  setup() {
    const value = ref();

    effect(() => {
      console.log('Rate', value.value);
    });
    return () => (
      <Flex align="center" gap={8}>
        <div style={{ width: '100px' }}>评分</div>
        <Rate v-model:value={value.value}></Rate>
      </Flex>
    );
  },
});
