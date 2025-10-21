<script lang="tsx" setup>
import { CommentOutlined, DownOutlined, LeftOutlined, RightOutlined, UpOutlined } from '@ant-design/icons-vue';
import { Flex, FloatButton } from '@/components';
import type { CSSProperties } from 'vue';

const BOX_SIZE = 100;
const BUTTON_SIZE = 40;

const wrapperStyle: CSSProperties = {
  width: '100%',
  height: '100vh',
  overflow: 'hidden',
  position: 'relative',
};

const boxStyle: CSSProperties = {
  width: `${BOX_SIZE}px`,
  height: `${BOX_SIZE}px`,
  position: 'relative',
};

const insetInlineEnd: CSSProperties['insetInlineEnd'][] = [
  (BOX_SIZE - BUTTON_SIZE) / 2,
  -(BUTTON_SIZE / 2),
  (BOX_SIZE - BUTTON_SIZE) / 2,
  BOX_SIZE - BUTTON_SIZE / 2,
];

const bottom: CSSProperties['bottom'][] = [
  BOX_SIZE - BUTTON_SIZE / 2,
  (BOX_SIZE - BUTTON_SIZE) / 2,
  -BUTTON_SIZE / 2,
  (BOX_SIZE - BUTTON_SIZE) / 2,
];

const icons = [<UpOutlined key="up" />, <RightOutlined key="right" />, <DownOutlined key="down" />, <LeftOutlined key="left" />];
</script>
<template>
  <Flex justify="space-evenly" align="center" :style="wrapperStyle">
    <div :style="boxStyle">
      <template v-for="(placement, i) in ['top', 'right', 'bottom', 'left'] as const" :key="placement">
        <FloatButton.Group
          trigger="click"
          :placement="placement"
          :style="{
            position: 'absolute',
            insetInlineEnd: `${insetInlineEnd[i]}px`,
            bottom: `${bottom[i]}px`,
          }"
          :icon="icons[i]"
        >
          <FloatButton />
          <FloatButton :icon="CommentOutlined" />
        </FloatButton.Group>
      </template>
    </div>
  </Flex>
</template>
