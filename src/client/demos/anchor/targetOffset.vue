<script lang="tsx" setup>
import { Anchor, Col, Row } from '@/components';
import { onMounted, ref, useTemplateRef, type CSSProperties } from 'vue';

const style: CSSProperties = {
  height: '30vh',
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  position: 'fixed',
  top: 0,
  insetInlineStart: 0,
  width: '75%',
  color: '#fff',
};

const topRef = useTemplateRef('topRef');
const targetOffset = ref<number>();

onMounted(() => {
  targetOffset.value = topRef.value?.clientHeight;
});
</script>
<template>
  <div>
    <Row>
      <Col :span="18">
        <div id="part-1" :style="{ height: '100vh', background: 'rgba(255,0,0,0.02)', marginTop: '30vh' }">Part 1</div>
        <div id="part-2" :style="{ height: '100vh', background: 'rgba(0,255,0,0.02)' }">Part 2</div>
        <div id="part-3" :style="{ height: '100vh', background: 'rgba(0,0,255,0.02)' }">Part 3</div>
      </Col>
      <Col span="{6}">
        <Anchor
          :target-offset="targetOffset"
          :items="[
            { key: 'part-1', href: '#part-1', title: 'Part 1' },
            { key: 'part-2', href: '#part-2', title: 'Part 2' },
            { key: 'part-3', href: '#part-3', title: 'Part 3' },
          ]"
        />
      </Col>
    </Row>
    <div :style="style" ref="topRef">
      <div>Fixed Top Block</div>
    </div>
  </div>
</template>
