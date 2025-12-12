<script lang="tsx" setup>
import { computed, onErrorCaptured, reactive, type VNode } from 'vue';
import Alert from './Alert.vue';
export interface ErrorBoundaryProps {
  title?: any;
  description?: any;
  id?: string;
}

interface ErrorBoundaryStates {
  error?: Error | null;
  info?: {
    componentStack?: string;
  };
}

defineOptions({ name: 'ErrorBoundary', inheritAttrs: false, compatConfig: { MODE: 3 } });

const { title, description, id } = defineProps<ErrorBoundaryProps>();

const slots = defineSlots<{ title?: () => VNode[]; description?: () => VNode[] }>();

const state = reactive<ErrorBoundaryStates>({
  error: undefined,
  info: {
    componentStack: '',
  },
});

onErrorCaptured((error, _, info) => {
  state.error = error;
  state.info.componentStack = info;
});

const componentStack = computed(() => state.info?.componentStack || null);
const errorMessage = computed(() => (typeof title === 'undefined' ? (state.error || '').toString() : title));
const errorDescription = computed(() => (typeof description === 'undefined' ? componentStack : slots.description || description));
</script>
<template>
  <Alert v-if="state.error" :id="id" type="error" :title="slots.title || errorMessage">
    <template #description>
      <pre :style="{ fontSize: '0.9em', overflowX: 'auto' }">
        <slot name="description">
          {{ errorDescription }}
        </slot>
      </pre>
    </template>
  </Alert>
  <slot v-else></slot>
</template>
