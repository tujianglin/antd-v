<script lang="tsx" setup>
import { Col, Row, Statistic, type StatisticTimerProps } from '@/components';

const { Timer } = Statistic;

const deadline = Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 30; // Dayjs is also OK
const before = Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 30;

const onFinish: StatisticTimerProps['onFinish'] = () => {
  console.log('finished!');
};

const onChange: StatisticTimerProps['onChange'] = (val) => {
  if (typeof val === 'number' && 4.95 * 1000 < val && val < 5 * 1000) {
    console.log('changed!');
  }
};
</script>
<template>
  <Row :gutter="16">
    <Col :span="12">
      <Timer type="countdown" :value="deadline" @finish="onFinish" />
    </Col>
    <Col :span="12">
      <Timer type="countdown" title="Million Seconds" :value="deadline" format="HH:mm:ss:SSS" />
    </Col>
    <Col :span="12">
      <Timer type="countdown" title="Countdown" :value="Date.now() + 10 * 1000" @change="onChange" />
    </Col>
    <Col :span="12">
      <Timer type="countup" title="Countup" :value="before" @change="onChange" />
    </Col>
    <Col :span="24" class="mb-8">
      <Timer type="countdown" title="Day Level (Countdown)" :value="deadline" format="D 天 H 时 m 分 s 秒" />
    </Col>
    <Col :span="24" class="mb-8">
      <Timer type="countup" title="Day Level (Countup)" :value="before" format="D 天 H 时 m 分 s 秒" />
    </Col>
  </Row>
</template>
