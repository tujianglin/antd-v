import { Flex, Switch } from '@/components';
import { defineComponent, effect, ref } from 'vue';

export default defineComponent({
  setup() {
    const value = ref(true);

    effect(() => {
      console.log('Switch', value.value);
    });
    return () => (
      <Flex align="center" gap={8}>
        <div style={{ width: '100px' }}>开关</div>
        <Switch v-model:checked={value.value}></Switch>
      </Flex>
    );
  },
});
