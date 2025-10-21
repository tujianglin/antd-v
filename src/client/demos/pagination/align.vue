<script lang="tsx" setup>
import { Pagination } from '@/components';
</script>
<template>
  <Pagination align="start" :current="1" :total="50" />
  <br />
  <Pagination align="center" :current="1" :total="50" />
  <br />
  <Pagination align="end" :current="1" :total="50" />
</template>
