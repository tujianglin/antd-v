<script lang="tsx" setup>
import { Button, Popconfirm } from '@/components';
import { onMounted, type CSSProperties } from 'vue';

const style: CSSProperties = {
  width: '300vw',
  height: '300vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
onMounted(() => {
  document.documentElement.scrollTop = document.documentElement.clientHeight;
  document.documentElement.scrollLeft = document.documentElement.clientWidth;
});
</script>
<template>
  <div :style="style">
    <Popconfirm title="Thanks for using antd. Have a nice day !" open>
      <Button type="primary">Scroll The Window</Button>
    </Popconfirm>
  </div>
</template>
