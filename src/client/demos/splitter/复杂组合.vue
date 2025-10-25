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
      <Splitter style={{ height: '300px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
        <Splitter.Panel collapsible>
          <Desc text="Left" />
        </Splitter.Panel>
        <Splitter.Panel>
          <Splitter orientation="vertical">
            <Splitter.Panel>
              <Desc text="Top" />
            </Splitter.Panel>
            <Splitter.Panel>
              <Desc text="Bottom" />
            </Splitter.Panel>
          </Splitter>
        </Splitter.Panel>
      </Splitter>
    );
  },
});
</script>
<style lang="less" scoped></style>
