<script lang="tsx" setup>
import { Col, Row, Statistic } from '@/components';
import { LikeOutlined } from '@ant-design/icons-vue';
</script>
<template>
  <Row :gutter="16">
    <Col :span="12">
      <Statistic title="Feedback" :value="1128" :prefix="LikeOutlined" />
    </Col>
    <Col :span="12">
      <Statistic title="Account Balance (CNY)" :value="93" suffix="/ 100" />
    </Col>
  </Row>
</template>
