import { Flex, Radio } from '@/components';
import { BarChartOutlined, DotChartOutlined, LineChartOutlined, PieChartOutlined } from '@ant-design/icons-vue';
import { defineComponent, ref } from 'vue';
import type { RadioChangeEvent } from '../interface';

export default defineComponent({
  setup() {
    const value = ref(1);

    const onChange = (e: RadioChangeEvent) => {
      value.value = e.target.value;
    };

    return () => (
      <>
        <Radio.Group
          onChange={onChange}
          value={value}
          options={[
            {
              value: 1,
              class: 'option-1',
              label: (
                <Flex gap="small" justify="center" align="center" vertical>
                  <LineChartOutlined style={{ fontSize: '18px' }} />
                  LineChart
                </Flex>
              ),
            },
            {
              value: 2,
              class: 'option-2',
              label: (
                <Flex gap="small" justify="center" align="center" vertical>
                  <DotChartOutlined style={{ fontSize: '18px' }} />
                  DotChart
                </Flex>
              ),
            },
            {
              value: 3,
              class: 'option-3',
              label: (
                <Flex gap="small" justify="center" align="center" vertical>
                  <BarChartOutlined style={{ fontSize: '18px' }} />
                  BarChart
                </Flex>
              ),
            },
            {
              value: 4,
              class: 'option-4',
              label: (
                <Flex gap="small" justify="center" align="center" vertical>
                  <PieChartOutlined style={{ fontSize: '18px' }} />
                  PieChart
                </Flex>
              ),
            },
          ]}
        />
      </>
    );
  },
});
