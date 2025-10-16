import { AutoComplete, Flex, type AutoCompleteProps } from '@/components';
import { defineComponent, effect, ref } from 'vue';

const mockVal = (str: string, repeat = 1) => ({
  value: str.repeat(repeat),
});

export default defineComponent(() => {
  const value = ref();
  const options = ref<AutoCompleteProps['options']>([]);

  const getPanelValue = (searchText: string) =>
    !searchText ? [] : [mockVal(searchText), mockVal(searchText, 2), mockVal(searchText, 3)];

  const onSelect = (data: string) => {
    console.log('onSelect', data);
  };

  effect(() => {
    console.log('AutoComplete', value.value);
  });

  return () => (
    <Flex align="center" gap={8}>
      <div style={{ width: '100px' }}>自动完成</div>
      <AutoComplete
        v-model:value={value.value}
        options={options.value}
        style={{ width: '200px' }}
        onSelect={onSelect}
        showSearch={{
          onSearch: (text) => (options.value = getPanelValue(text)),
        }}
        placeholder="input here"
      />
    </Flex>
  );
});
