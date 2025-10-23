<script lang="tsx" setup>
import { Card } from '@/components';
import { type CSSProperties } from 'vue';

const gridStyle: CSSProperties = {
  width: '25%',
  textAlign: 'center',
};
</script>
<template>
  <Card title="Card Title">
    <Card.Grid :style="gridStyle">Content</Card.Grid>
    <Card.Grid :hoverable="false" :style="gridStyle"> Content </Card.Grid>
    <Card.Grid :style="gridStyle">Content</Card.Grid>
    <Card.Grid :style="gridStyle">Content</Card.Grid>
    <Card.Grid :style="gridStyle">Content</Card.Grid>
    <Card.Grid :style="gridStyle">Content</Card.Grid>
    <Card.Grid :style="gridStyle">Content</Card.Grid>
  </Card>
</template>
