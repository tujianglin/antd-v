<script lang="tsx" setup>
import { Button, ConfigProvider, Flex, Tooltip } from '@/components';

const text = <span>Title</span>;

const content = (
  <div>
    <p>Content</p>
    <p>Content</p>
  </div>
);

const buttonWidth = 80;
</script>
<template>
  <ConfigProvider :button="{ style: { width: buttonWidth, margin: `${4}px` } }">
    <Flex vertical justify="center" align="center" class="demo">
      <Flex justify="center" align="center" :style="{ whiteSpace: 'nowrap' }">
        <Tooltip placement="topLeft" :title="text" :content="content">
          <Button>TL</Button>
        </Tooltip>
        <Tooltip placement="top" :title="text" :content="content">
          <Button>Top</Button>
        </Tooltip>
        <Tooltip placement="topRight" :title="text" :content="content">
          <Button>TR</Button>
        </Tooltip>
      </Flex>
      <Flex :style="{ width: `${buttonWidth * 5 + 32}px` }" justify="space-between" align="center">
        <Flex align="center" vertical>
          <Tooltip placement="leftTop" :title="text" :content="content">
            <Button>LT</Button>
          </Tooltip>
          <Tooltip placement="left" :title="text" :content="content">
            <Button>Left</Button>
          </Tooltip>
          <Tooltip placement="leftBottom" :title="text" :content="content">
            <Button>LB</Button>
          </Tooltip>
        </Flex>
        <Flex align="center" vertical>
          <Tooltip placement="rightTop" :title="text" :content="content">
            <Button>RT</Button>
          </Tooltip>
          <Tooltip placement="right" :title="text" :content="content">
            <Button>Right</Button>
          </Tooltip>
          <Tooltip placement="rightBottom" :title="text" :content="content">
            <Button>RB</Button>
          </Tooltip>
        </Flex>
      </Flex>
      <Flex justify="center" align="center" :style="{ whiteSpace: 'nowrap' }">
        <Tooltip placement="bottomLeft" :title="text" :content="content">
          <Button>BL</Button>
        </Tooltip>
        <Tooltip placement="bottom" :title="text" :content="content">
          <Button>Bottom</Button>
        </Tooltip>
        <Tooltip placement="bottomRight" :title="text" :content="content">
          <Button>BR</Button>
        </Tooltip>
      </Flex>
    </Flex>
  </ConfigProvider>
</template>
