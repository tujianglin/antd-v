<script lang="tsx">
import { Flex, Radio, Splitter } from '@/components';
import type { CheckboxGroupProps } from '@/components/checkbox/Group.vue';
import { defineComponent, ref } from 'vue';

const options: CheckboxGroupProps<'auto' | boolean>['options'] = [
  { label: 'Auto', value: 'auto' },
  { label: 'True', value: true },
  { label: 'False', value: false },
];

export default defineComponent({
  setup() {
    const showIconMode = ref<'auto' | boolean>(true);

    const Desc = (props) => (
      <Flex justify="center" align="center" style={{ height: '100%' }}>
        {props.text}
      </Flex>
    );
    return () => (
      <Flex vertical gap={20}>
        <Flex gap={5}>
          <p>ShowCollapsibleIcon: </p>
          <Radio.Group options={options} v-model:value={showIconMode.value} />
        </Flex>
        <Splitter style={{ height: '200px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
          <Splitter.Panel collapsible={{ start: true, end: true, showCollapsibleIcon: showIconMode.value }} min="20%">
            <Desc text="First" />
          </Splitter.Panel>
          <Splitter.Panel collapsible={{ start: true, end: true, showCollapsibleIcon: showIconMode.value }}>
            <Desc text="Second" />
          </Splitter.Panel>
          <Splitter.Panel collapsible={{ start: true, end: true, showCollapsibleIcon: showIconMode.value }}>
            <Desc text="Third" />
          </Splitter.Panel>
        </Splitter>
      </Flex>
    );
  },
});
</script>
<style lang="less" scoped></style>
