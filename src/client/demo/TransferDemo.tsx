import { Flex, Transfer } from '@/components';
import { defineComponent, effect, ref } from 'vue';

interface RecordType {
  key: string;
  title: string;
  description: string;
}

const mockData = Array.from({ length: 20 }).map<RecordType>((_, i) => ({
  key: i.toString(),
  title: `content${i + 1}`,
  description: `description of content${i + 1}`,
}));

const initialTargetKeys = mockData.filter((item) => Number(item.key) > 10).map((item) => item.key);

export default defineComponent({
  setup() {
    const targetKeys = ref(initialTargetKeys);
    const selectedKeys = ref([]);

    effect(() => {
      console.log('Transfer', targetKeys.value);
    });
    return () => (
      <Flex align="center" gap={8}>
        <div style={{ width: '100px' }}>穿梭框</div>
        <Transfer
          dataSource={mockData}
          titles={['Source', 'Target']}
          v-model:targetKeys={targetKeys.value}
          v-model:selectedKeys={selectedKeys.value}
          render={(item) => item.title}
        />
      </Flex>
    );
  },
});
