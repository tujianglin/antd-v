<script lang="tsx" setup>
import { BarChartOutlined, DotChartOutlined, LineChartOutlined, PieChartOutlined } from '@ant-design/icons-vue';
import type { RadioChangeEvent } from '@/components';
import { Flex, Radio } from '@/components';
import { ref } from 'vue';

const value = ref(1);

const onChange = (e: RadioChangeEvent) => {
  console.log(e);
};

const options = [
  {
    value: 1,
    className: 'option-1',
    label: (
      <Flex gap="small" justify="center" align="center" vertical>
        <LineChartOutlined style={{ fontSize: `${18}px` }} />
        LineChart
      </Flex>
    ),
  },
  {
    value: 2,
    className: 'option-2',
    label: (
      <Flex gap="small" justify="center" align="center" vertical>
        <DotChartOutlined style={{ fontSize: `${18}px` }} />
        DotChart
      </Flex>
    ),
  },
  {
    value: 3,
    className: 'option-3',
    label: (
      <Flex gap="small" justify="center" align="center" vertical>
        <BarChartOutlined style={{ fontSize: `${18}px` }} />
        BarChart
      </Flex>
    ),
  },
  {
    value: 4,
    className: 'option-4',
    label: (
      <Flex gap="small" justify="center" align="center" vertical>
        <PieChartOutlined style={{ fontSize: `${18}px` }} />
        PieChart
      </Flex>
    ),
  },
];
</script>
<template>
  <Radio.Group @change="onChange" v-model:value="value" :options="options" />
</template>
