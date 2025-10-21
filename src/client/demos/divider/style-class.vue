<script lang="tsx" setup>
import type { DividerProps } from '@/components';
import { Divider } from '@/components';

const classNamesObject: DividerProps['classNames'] = {
  root: 'demo-divider-root',
  content: 'demo-divider-content',
  rail: 'demo-divider-rail',
};

const classNamesFn: DividerProps['classNames'] = (info) => {
  if (info.props.titlePlacement === 'start') {
    return { root: 'demo-divider-root--start' };
  }
  return { root: 'demo-divider-root--default' };
};

const stylesObject: DividerProps['styles'] = {
  root: { borderWidth: `${2}px`, borderStyle: 'dashed' },
  content: { fontStyle: 'italic' },
  rail: { opacity: 0.85 },
};

const stylesFn: DividerProps['styles'] = (info) => {
  if (info.props.size === 'small') {
    return { root: { opacity: 0.6, cursor: 'default' } };
  }
  return { root: { backgroundColor: '#fafafa', borderColor: '#d9d9d9' } };
};
</script>
<template>
  <div>
    <Divider :class-names="classNamesObject">classNames Object</Divider>
    <Divider title-placement="start" :class-names="classNamesFn"> classNames Function </Divider>
    <Divider :styles="stylesObject">styles Object</Divider>
    <Divider size="small" :styles="stylesFn"> styles Function </Divider>
  </div>
</template>
