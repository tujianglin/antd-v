<script lang="tsx">
import { Button, ConfigProvider, Flex, Popconfirm } from '@/components';

import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    const text = 'Are you sure to delete this task?';
    const description = 'Delete the task';
    const buttonWidth = 80;

    return () => (
      <>
        <ConfigProvider button={{ style: { width: `${buttonWidth}px`, margin: '4px' } }}>
          <Flex vertical justify="center" align="center" class="demo">
            <Flex justify="center" align="center" style={{ whiteSpace: 'nowrap' }}>
              <Popconfirm placement="topLeft" title={text} description={description} okText="Yes" cancelText="No">
                <Button>TL</Button>
              </Popconfirm>
              <Popconfirm placement="top" title={text} description={description} okText="Yes" cancelText="No">
                <Button>Top</Button>
              </Popconfirm>
              <Popconfirm placement="topRight" title={text} description={description} okText="Yes" cancelText="No">
                <Button>TR</Button>
              </Popconfirm>
            </Flex>
            <Flex style={{ width: `${buttonWidth * 5 + 32}px` }} justify="space-between" align="center">
              <Flex align="center" vertical>
                <Popconfirm placement="leftTop" title={text} description={description} okText="Yes" cancelText="No">
                  <Button>LT</Button>
                </Popconfirm>
                <Popconfirm placement="left" title={text} description={description} okText="Yes" cancelText="No">
                  <Button>Left</Button>
                </Popconfirm>
                <Popconfirm placement="leftBottom" title={text} description={description} okText="Yes" cancelText="No">
                  <Button>LB</Button>
                </Popconfirm>
              </Flex>
              <Flex align="center" vertical>
                <Popconfirm placement="rightTop" title={text} description={description} okText="Yes" cancelText="No">
                  <Button>RT</Button>
                </Popconfirm>
                <Popconfirm placement="right" title={text} description={description} okText="Yes" cancelText="No">
                  <Button>Right</Button>
                </Popconfirm>
                <Popconfirm placement="rightBottom" title={text} description={description} okText="Yes" cancelText="No">
                  <Button>RB</Button>
                </Popconfirm>
              </Flex>
            </Flex>
            <Flex justify="center" align="center" style={{ whiteSpace: 'nowrap' }}>
              <Popconfirm placement="bottomLeft" title={text} description={description} okText="Yes" cancelText="No">
                <Button>BL</Button>
              </Popconfirm>
              <Popconfirm placement="bottom" title={text} description={description} okText="Yes" cancelText="No">
                <Button>Bottom</Button>
              </Popconfirm>
              <Popconfirm placement="bottomRight" title={text} description={description} okText="Yes" cancelText="No">
                <Button>BR</Button>
              </Popconfirm>
            </Flex>
          </Flex>
        </ConfigProvider>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
