<script lang="tsx" setup>
import { Pagination } from '@/components';
</script>
<template>
  <Pagination simple :current="2" :total="500" :show-size-changer="false" />
  <br />
  <Pagination :simple="{ readOnly: true }" :current="2" :total="50" />
  <br />
  <Pagination disabled simple :current="2" :total="50" />
</template>
