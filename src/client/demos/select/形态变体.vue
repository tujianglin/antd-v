<script lang="tsx" setup>
import { Flex, Select } from '@/components';
</script>
<template>
  <Flex :gap="12" vertical>
    <Flex :gap="8">
      <Select
        placeholder="Outlined"
        class="!flex-1"
        :options="[
          { value: 'jack', label: 'Jack' },
          { value: 'lucy', label: 'Lucy' },
          { value: 'Yiminghe', label: 'yiminghe' },
        ]"
      />
      <Select
        mode="multiple"
        :value="['lucy']"
        placeholder="Outlined"
        class="!flex-1"
        :options="[
          { value: 'jack', label: 'Jack' },
          { value: 'lucy', label: 'Lucy' },
          { value: 'Yiminghe', label: 'yiminghe' },
        ]"
      />
    </Flex>
    <Flex :gap="8">
      <Select
        placeholder="Filled"
        variant="filled"
        class="!flex-1"
        :options="[
          { value: 'jack', label: 'Jack' },
          { value: 'lucy', label: 'Lucy' },
          { value: 'Yiminghe', label: 'yiminghe' },
        ]"
      />
      <Select
        mode="multiple"
        :value="['lucy']"
        placeholder="Filled"
        variant="filled"
        class="!flex-1"
        :options="[
          { value: 'jack', label: 'Jack' },
          { value: 'lucy', label: 'Lucy' },
          { value: 'Yiminghe', label: 'yiminghe' },
        ]"
      />
    </Flex>
    <Flex :gap="8">
      <Select
        placeholder="Borderless"
        variant="borderless"
        class="!flex-1"
        :options="[
          { value: 'jack', label: 'Jack' },
          { value: 'lucy', label: 'Lucy' },
          { value: 'Yiminghe', label: 'yiminghe' },
        ]"
      />
      <Select
        mode="multiple"
        :value="['lucy']"
        placeholder="Borderless"
        variant="borderless"
        class="!flex-1"
        :options="[
          { value: 'jack', label: 'Jack' },
          { value: 'lucy', label: 'Lucy' },
          { value: 'Yiminghe', label: 'yiminghe' },
        ]"
      />
    </Flex>
    <Flex :gap="8">
      <Select
        placeholder="Underlined"
        variant="underlined"
        class="!flex-1"
        :options="[
          { value: 'jack', label: 'Jack' },
          { value: 'lucy', label: 'Lucy' },
          { value: 'Yiminghe', label: 'yiminghe' },
        ]"
      />
      <Select
        mode="multiple"
        :value="['lucy']"
        placeholder="Underlined"
        variant="underlined"
        class="!flex-1"
        :options="[
          { value: 'jack', label: 'Jack' },
          { value: 'lucy', label: 'Lucy' },
          { value: 'Yiminghe', label: 'yiminghe' },
        ]"
      />
    </Flex>
  </Flex>
</template>
