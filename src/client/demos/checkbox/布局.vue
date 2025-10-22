<script lang="tsx" setup>
import { Checkbox, Col, Row } from '@/components';
import { effect, ref } from 'vue';

const checkedList = ref(['A']);

effect(() => {
  console.log(checkedList.value);
});
</script>
<template>
  <Checkbox.Group v-model:value="checkedList" class="!w-full">
    <Row>
      <Col :span="8">
        <Checkbox value="A">A</Checkbox>
      </Col>
      <Col :span="8">
        <Checkbox value="B">B</Checkbox>
      </Col>
      <Col :span="8">
        <Checkbox value="C">C</Checkbox>
      </Col>
      <Col :span="8">
        <Checkbox value="D">D</Checkbox>
      </Col>
      <Col :span="8">
        <Checkbox value="E">E</Checkbox>
      </Col>
    </Row>
  </Checkbox.Group>
</template>
