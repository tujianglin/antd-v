<script lang="tsx" setup>
import { Button, Popover } from '@/components';
import { ref } from 'vue';

const hoverContent = <div>This is hover content.</div>;

const clickContent = <div>This is click content.</div>;

const clicked = ref(false);
const hovered = ref(false);

const hide = () => {
  clicked.value = false;
  hovered.value = false;
};

const handleHoverChange = (open: boolean) => {
  console.log(open);
  hovered.value = open;
  clicked.value = false;
};

const handleClickChange = (open: boolean) => {
  hovered.value = false;
  clicked.value = open;
};
const content = (
  <div>
    {clickContent}
    <a onClick={hide}>Close</a>
  </div>
);
</script>
<template>
  <Popover
    :style="{ width: `${500}px` }"
    :content="hoverContent"
    title="Hover title"
    trigger="hover"
    :open="hovered"
    @open-change="handleHoverChange"
  >
    <Popover :content="content" title="Click title" trigger="click" :open="clicked" @open-change="handleClickChange">
      <Button>Hover and click</Button>
    </Popover>
  </Popover>
</template>
