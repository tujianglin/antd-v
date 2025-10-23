<script lang="tsx" setup>
import { Card, Col, Row, Statistic } from '@/components';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons-vue';
</script>
<template>
  <Row :gutter="16">
    <Col :span="12">
      <Card variant="borderless">
        <Statistic
          title="Active"
          :value="11.28"
          :precision="2"
          :styles="{ content: { color: '#3f8600' } }"
          :prefix="ArrowUpOutlined"
          suffix="%"
        />
      </Card>
    </Col>
    <Col :span="12">
      <Card variant="borderless">
        <Statistic
          title="Idle"
          :value="9.3"
          :precision="2"
          :styles="{ content: { color: '#cf1322' } }"
          :prefix="ArrowDownOutlined"
          suffix="%"
        />
      </Card>
    </Col>
  </Row>
</template>
