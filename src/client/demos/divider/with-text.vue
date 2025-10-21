<script lang="tsx" setup>
import { Divider } from '@/components';
</script>
<template>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista probare, quae sunt a te dicta?
    Refert tamen, quo modo.
  </p>
  <Divider>Text</Divider>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista probare, quae sunt a te dicta?
    Refert tamen, quo modo.
  </p>
  <Divider title-placement="start">Left Text</Divider>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista probare, quae sunt a te dicta?
    Refert tamen, quo modo.
  </p>
  <Divider title-placement="end">Right Text</Divider>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista probare, quae sunt a te dicta?
    Refert tamen, quo modo.
  </p>
  <Divider title-placement="start" :styles="{ content: { margin: 0 } }"> Left Text margin with 0 </Divider>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista probare, quae sunt a te dicta?
    Refert tamen, quo modo.
  </p>
  <Divider title-placement="end" :styles="{ content: { margin: '0 50px' } }"> Right Text margin with 50px </Divider>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista probare, quae sunt a te dicta?
    Refert tamen, quo modo.
  </p>
</template>
