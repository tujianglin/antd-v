<script lang="tsx" setup>
import { Button, ConfigProvider, Flex, Popover, Segmented, type PopoverProps } from '@/components';
import { computed, ref } from 'vue';

const text = <span>Title</span>;

const content = (
  <div>
    <p>Content</p>
    <p>Content</p>
  </div>
);

const buttonWidth = 80;

const arrow = ref<'Show' | 'Hide' | 'Center'>('Show');

const mergedArrow = computed<PopoverProps['arrow']>(() => {
  if (arrow.value === 'Hide') {
    return false;
  }

  if (arrow.value === 'Show') {
    return true;
  }

  return {
    pointAtCenter: true,
  };
});
</script>
<template>
  <ConfigProvider :button="{ style: { width: buttonWidth, margin: `${4}px` } }">
    <Segmented :options="['Show', 'Hide', 'Center']" v-model:value="arrow" :style="{ marginBottom: '24px' }" />
    <Flex vertical justify="center" align="center" class="demo">
      <Flex justify="center" align="center" :style="{ whiteSpace: 'nowrap' }">
        <Popover placement="topLeft" :title="text" :content="content" :arrow="mergedArrow">
          <Button>TL</Button>
        </Popover>
        <Popover placement="top" :title="text" :content="content" :arrow="mergedArrow">
          <Button>Top</Button>
        </Popover>
        <Popover placement="topRight" :title="text" :content="content" :arrow="mergedArrow">
          <Button>TR</Button>
        </Popover>
      </Flex>
      <Flex :style="{ width: `${buttonWidth * 5 + 32}px` }" justify="space-between" align="center">
        <Flex align="center" vertical>
          <Popover placement="leftTop" :title="text" :content="content" :arrow="mergedArrow">
            <Button>LT</Button>
          </Popover>
          <Popover placement="left" :title="text" :content="content" :arrow="mergedArrow">
            <Button>Left</Button>
          </Popover>
          <Popover placement="leftBottom" :title="text" :content="content" :arrow="mergedArrow">
            <Button>LB</Button>
          </Popover>
        </Flex>
        <Flex align="center" vertical>
          <Popover placement="rightTop" :title="text" :content="content" :arrow="mergedArrow">
            <Button>RT</Button>
          </Popover>
          <Popover placement="right" :title="text" :content="content" :arrow="mergedArrow">
            <Button>Right</Button>
          </Popover>
          <Popover placement="rightBottom" :title="text" :content="content" :arrow="mergedArrow">
            <Button>RB</Button>
          </Popover>
        </Flex>
      </Flex>
      <Flex justify="center" align="center" :style="{ whiteSpace: 'nowrap' }">
        <Popover placement="bottomLeft" :title="text" :content="content" :arrow="mergedArrow">
          <Button>BL</Button>
        </Popover>
        <Popover placement="bottom" :title="text" :content="content" :arrow="mergedArrow">
          <Button>Bottom</Button>
        </Popover>
        <Popover placement="bottomRight" :title="text" :content="content" :arrow="mergedArrow">
          <Button>BR</Button>
        </Popover>
      </Flex>
    </Flex>
  </ConfigProvider>
</template>
