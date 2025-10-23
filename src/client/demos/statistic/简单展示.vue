<script lang="tsx" setup>
import { Button, Col, Row, Statistic } from '@/components';
</script>
<template>
  <Row :gutter="16">
    <Col :span="12">
      <Statistic title="Active Users" :value="112893" />
    </Col>
    <Col :span="12">
      <Statistic title="Account Balance (CNY)" :value="112893" :precision="2" />
      <Button class="mb-4" type="primary"> Recharge </Button>
    </Col>
    <Col :span="12">
      <Statistic title="Active Users" :value="112893" loading />
    </Col>
  </Row>
</template>
