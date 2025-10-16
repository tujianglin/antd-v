import { Flex, TreeSelect } from '@/components';
import { defineComponent, effect, ref } from 'vue';

const treeData = [
  {
    value: 'parent 1',
    title: 'parent 1',
    children: [
      {
        value: 'parent 1-0',
        title: 'parent 1-0',
        children: [
          {
            value: 'leaf1',
            title: 'leaf1',
          },
          {
            value: 'leaf2',
            title: 'leaf2',
          },
          {
            value: 'leaf3',
            title: 'leaf3',
          },
          {
            value: 'leaf4',
            title: 'leaf4',
          },
          {
            value: 'leaf5',
            title: 'leaf5',
          },
          {
            value: 'leaf6',
            title: 'leaf6',
          },
        ],
      },
      {
        value: 'parent 1-1',
        title: 'parent 1-1',
        children: [
          {
            value: 'leaf11',
            title: <b style={{ color: '#08c' }}>leaf11</b>,
          },
        ],
      },
    ],
  },
];

export default defineComponent({
  setup() {
    const value = ref();

    effect(() => {
      console.log('TreeSelect', value.value);
    });
    return () => (
      <Flex align="center" gap={8}>
        <div style={{ width: '100px' }}>树选择</div>
        <TreeSelect
          showSearch
          style={{ width: '100%' }}
          v-model:value={value.value}
          styles={{
            popup: {
              root: { maxHeight: 400, overflow: 'auto' },
            },
          }}
          placeholder="Please select"
          allowClear
          treeDefaultExpandAll
          treeData={treeData}
        />
      </Flex>
    );
  },
});
