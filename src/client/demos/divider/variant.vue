<script lang="tsx" setup>
import { Divider } from '@/components';
</script>

<template>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista probare, quae sunt a te dicta?
    Refert tamen, quo modo.
  </p>
  <Divider class="!border-[#7cb305]">Solid</Divider>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista probare, quae sunt a te dicta?
    Refert tamen, quo modo.
  </p>
  <Divider variant="dotted" class="!border-[#7cb305]"> Dotted </Divider>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista probare, quae sunt a te dicta?
    Refert tamen, quo modo.
  </p>
  <Divider variant="dashed" class="!border-[#7cb305]" dashed> Dashed </Divider>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista probare, quae sunt a te dicta?
    Refert tamen, quo modo.
  </p>
</template>
