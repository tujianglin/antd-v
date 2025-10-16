import { Flex, Mentions } from '@/components';
import { defineComponent, effect, ref } from 'vue';

export default defineComponent({
  setup() {
    const value = ref('@afc163');

    effect(() => {
      console.log('Mentions', value.value);
    });
    return () => (
      <Flex align="center" gap={8}>
        <div style={{ 'min-width': '100px' }}>提及</div>
        <Mentions
          v-model:value={value.value}
          style={{ width: '100%' }}
          options={[
            {
              value: 'afc163',
              label: 'afc163',
            },
            {
              value: 'zombieJ',
              label: 'zombieJ',
            },
            {
              value: 'yesmeck',
              label: 'yesmeck',
            },
          ]}
        />
      </Flex>
    );
  },
});
