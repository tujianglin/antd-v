<script lang="tsx" setup>
import { Flex, Input } from '@/components';
import { runes } from 'runes2';
</script>
<template>
  <Flex vertical :gap="16">
    <div>
      <Input
        :count="{
          show: true,
          max: 10,
        }"
        value="Hello, antd!"
      />
    </div>

    <div>
      <Input
        :count="{
          show: true,
          strategy: (txt) => runes(txt).length,
        }"
        value="🔥🔥🔥"
      />
    </div>

    <div>
      <Input
        :count="{
          show: true,
          max: 6,
          strategy: (txt) => runes(txt).length,
          exceedFormatter: (txt, { max }) => runes(txt).slice(0, max).join(''),
        }"
        value="🔥 antd"
      />
    </div>
  </Flex>
</template>
