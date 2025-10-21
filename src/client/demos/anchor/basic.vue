<script lang="tsx" setup>
import { Anchor, Col, Row } from '@/components';
</script>
<template>
  <Row>
    <Col :span="16">
      <div id="part-1" :style="{ height: '100vh', backgroundColor: 'rgba(255,0,0,0.02)' }"></div>
      <div id="part-2" :style="{ height: '100vh', backgroundColor: 'rgba(0,255,0,0.02)' }"></div>
      <div id="part-3" :style="{ height: '100vh', backgroundColor: 'rgba(0,0,255,0.02)' }"></div>
    </Col>
    <Col :span="8">
      <Anchor
        :items="[
          {
            key: 'part-1',
            href: '#part-1',
            title: 'Part 1',
          },
          {
            key: 'part-2',
            href: '#part-2',
            title: 'Part 2',
          },
          {
            key: 'part-3',
            href: '#part-3',
            title: 'Part 3',
          },
        ]"
      />
    </Col>
  </Row>
</template>
