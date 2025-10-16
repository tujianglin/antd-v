import { Flex, Select } from '@/components';
import { defineComponent, effect, ref } from 'vue';

export default defineComponent({
  setup() {
    const value = ref('lucy');

    effect(() => {
      console.log('Select', value.value);
    });
    return () => (
      <Flex align="center" gap={8}>
        <div style={{ width: '100px' }}>选择器</div>
        <Select
          v-model:value={value.value}
          style={{ width: '120px' }}
          options={[
            { value: 'jack', label: 'Jack' },
            { value: 'lucy', label: 'Lucy' },
            { value: 'Yiminghe', label: 'yiminghe' },
            { value: 'disabled', label: 'Disabled', disabled: true },
          ]}
        ></Select>
      </Flex>
    );
  },
});
