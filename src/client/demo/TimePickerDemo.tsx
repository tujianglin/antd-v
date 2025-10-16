import { Flex, TimePicker } from '@/components';
import dayjs from 'dayjs';
import { defineComponent, effect, ref } from 'vue';

export default defineComponent({
  setup() {
    const value = ref(dayjs('00:00:00', 'HH:mm:ss'));

    effect(() => {
      console.log('TimePicker', value.value);
    });
    return () => (
      <Flex align="center" gap={8}>
        <div style={{ width: '100px' }}>时间选择器</div>
        <TimePicker v-model:value={value.value}></TimePicker>
      </Flex>
    );
  },
});
