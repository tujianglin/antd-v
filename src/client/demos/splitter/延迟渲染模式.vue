<script lang="tsx">
import { Flex, Space, Splitter } from '@/components';
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    const Desc = (props) => (
      <Flex justify="center" align="center" style={{ height: '100%' }}>
        {props.text}
      </Flex>
    );
    return () => (
      <Space vertical style={{ width: '100%' }}>
        <Splitter lazy style={{ height: '200px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
          <Splitter.Panel defaultSize="40%" min="20%" max="70%">
            <Desc text="First" />
          </Splitter.Panel>
          <Splitter.Panel>
            <Desc text="Second" />
          </Splitter.Panel>
        </Splitter>
        <Splitter lazy orientation="vertical" style={{ height: '200px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
          <Splitter.Panel defaultSize="40%" min="30%" max="70%">
            <Desc text="First" />
          </Splitter.Panel>
          <Splitter.Panel>
            <Desc text="Second" />
          </Splitter.Panel>
        </Splitter>
      </Space>
    );
  },
});
</script>
<style lang="less" scoped></style>
