<script lang="tsx" setup>
import { Card } from '@/components';
</script>
<template>
  <Card title="Card title">
    <Card type="inner" title="Inner Card title" extra="More"> Inner Card content </Card>
    <Card :style="{ marginTop: '16px' }" type="inner" title="Inner Card title" extra="More"> Inner Card content </Card>
  </Card>
</template>
