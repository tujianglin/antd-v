import { Flex, Slider } from '@/components';
import { defineComponent, effect, ref } from 'vue';

export default defineComponent({
  setup() {
    const value = ref(30);

    effect(() => {
      console.log('Slider', value.value);
    });
    return () => (
      <Flex align="center" gap={8}>
        <div style={{ width: '100px' }}>滑动输入条</div>
        <div style={{ width: '100%' }}>
          <Slider v-model:value={value.value}></Slider>
        </div>
      </Flex>
    );
  },
});
