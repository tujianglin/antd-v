<script lang="tsx" setup>
import { Alert, Button } from '@/components';

const ThrowError = () => {
  const onClick = () => {
    throw new Error('button click error');
  };

  return (
    <Button danger onClick={onClick}>
      Click me to throw a error
    </Button>
  );
};
</script>
<template>
  <Alert.ErrorBoundary>
    <ThrowError />
  </Alert.ErrorBoundary>
</template>
