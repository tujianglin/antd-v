<script lang="tsx" setup>
import { Button, message, Steps, theme } from '@/components';
import { computed, ref, type CSSProperties } from 'vue';

const steps = [
  {
    title: 'First',
    content: 'First-content',
  },
  {
    title: 'Second',
    content: 'Second-content',
  },
  {
    title: 'Last',
    content: 'Last-content',
  },
];

const { token } = theme.useToken();
const current = ref(0);

const next = () => {
  current.value = current.value + 1;
};

const prev = () => {
  current.value = current.value - 1;
};

const items = steps.map((item) => ({ key: item.title, title: item.title }));

const contentStyle = computed<CSSProperties>(() => ({
  lineHeight: '260px',
  textAlign: 'center',
  color: token.value.colorTextTertiary,
  backgroundColor: token.value.colorFillAlter,
  borderRadius: `${token.value.borderRadiusLG}px`,
  border: `1px dashed ${token.value.colorBorder}`,
  marginTop: `${16}px`,
}));
</script>
<template>
  <Steps :current="current" :items="items" />
  <div :style="contentStyle">{{ steps[current].content }}</div>
  <div :style="{ marginTop: `${24}px` }">
    <Button v-if="current < steps.length - 1" type="primary" @click="() => next()"> Next </Button>
    <Button v-if="current === steps.length - 1" type="primary" @click="() => message.success('Processing complete!')">
      Done
    </Button>
    <Button v-if="current > 0" :style="{ margin: '0 8px' }" @click="() => prev()"> Previous </Button>
  </div>
</template>
