import { DatePicker, Flex } from '@/components';
import { defineComponent, effect, ref } from 'vue';

export default defineComponent({
  setup() {
    const value = ref();

    effect(() => {
      console.log('DatePicker', value.value);
    });
    return () => (
      <Flex align="center" gap={8}>
        <div style={{ width: '100px' }}>日期选择器</div>
        <DatePicker v-model:value={value.value} />
      </Flex>
    );
  },
});
