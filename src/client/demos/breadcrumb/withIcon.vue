<script lang="tsx" setup>
import { Breadcrumb } from '@/components';
import { HomeOutlined, UserOutlined } from '@ant-design/icons-vue';
import { h } from 'vue';
</script>
<template>
  <Breadcrumb
    :dropdown-props="{}"
    :items="[
      {
        href: '',
        title: HomeOutlined,
      },
      {
        href: '',
        title: [h(UserOutlined), h('span', {}, 'Application List')],
      },
      {
        title: 'Application',
      },
    ]"
  />
</template>
