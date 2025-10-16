<script lang="tsx" setup>
import type { PickerMode } from '@/vc-component/picker/interface';
import Render from '@/vc-component/render';
import type { VueNode } from '@/vc-util/type';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons-vue';
import { TIME } from '../generatePicker/constant';

interface SuffixIconProps {
  picker?: PickerMode;
  hasFeedback?: boolean;
  feedbackIcon?: VueNode;
  suffixIcon?: VueNode;
}

const { picker, hasFeedback, feedbackIcon, suffixIcon } = defineProps<SuffixIconProps>();
</script>
<template>
  <template v-if="suffixIcon === undefined">
    <ClockCircleOutlined v-if="picker === TIME" />
    <CalendarOutlined v-else />
    <Render v-if="hasFeedback" :content="feedbackIcon" />
  </template>
  <template v-else>
    <Render :content="suffixIcon" />
  </template>
</template>
