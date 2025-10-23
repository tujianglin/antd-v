<script lang="tsx" setup>
import { Card } from '@/components';
import { ref } from 'vue';
const tabList = [
  {
    key: 'tab1',
    label: 'tab1',
  },
  {
    key: 'tab2',
    label: 'tab2',
  },
];

const contentList = {
  tab1: <p>content1</p>,
  tab2: <p>content2</p>,
};

const tabListNoTitle = [
  {
    key: 'article',
    label: 'article',
  },
  {
    key: 'app',
    label: 'app',
  },
  {
    key: 'project',
    label: 'project',
  },
];

const contentListNoTitle = {
  article: <p>article content</p>,
  app: <p>app content</p>,
  project: <p>project content</p>,
};

const activeTabKey1 = ref<string>('tab1');
const activeTabKey2 = ref<string>('app');
</script>
<template>
  <Card class="!w-full" title="Card title" extra="More" :tab-list="tabList" v-model:active-tab-key="activeTabKey1">
    <component :is="contentList[activeTabKey1]" />
  </Card>
  <br />
  <br />
  <Card
    class="!w-full"
    :tab-list="tabListNoTitle"
    v-model:active-tab-key="activeTabKey2"
    tab-bar-extra-content="More"
    :tab-props="{
      size: 'middle',
    }"
  >
    <component :is="contentListNoTitle[activeTabKey2]" />
  </Card>
</template>
