<script lang="tsx">
import { Flex, Splitter } from '@/components';
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    const Desc = (props) => (
      <Flex justify="center" align="center" style={{ height: '100%' }}>
        {props.text}
      </Flex>
    );
    return () => (
      <Splitter style={{ height: '200px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
        <Splitter.Panel defaultSize="40%" min="20%" max="70%">
          <Desc text="First" />
        </Splitter.Panel>
        <Splitter.Panel>
          <Desc text="Second" />
        </Splitter.Panel>
      </Splitter>
    );
  },
});
</script>
<style lang="less" scoped></style>
