<script lang="tsx" setup>
import { Col, InputNumber, Row, Slider } from '@/components';
import { ref } from 'vue';
const inputValue = ref(1);
</script>
<template>
  <Row>
    <Col :span="12">
      <Slider :min="1" :max="20" v-model:value="inputValue" />
    </Col>
    <Col :span="4">
      <InputNumber :min="1" :max="20" :style="{ margin: '0 16px' }" v-model:value="inputValue" />
    </Col>
  </Row>
</template>
