<script lang="tsx" setup>
import { falseToUndefined } from '@/vc-util/props';
import { useTemplateRef } from 'vue';
import AjaxUploader from './AjaxUploader.vue';
import type { RcFile, UploadProps } from './interface';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const props = withDefaults(defineProps<UploadProps>(), {
  component: 'span',
  prefixCls: 'rc-upload',
  data: () => ({}),
  headers: () => ({}),
  name: 'file',
  multipart: false,
  onStart: () => {},
  onError: () => {},
  onSuccess: () => {},
  multiple: false,
  beforeUpload: null,
  customRequest: null,
  withCredentials: false,
  openFileDialogOnClick: true,
  hasControlInside: false,
});

const uploader = useTemplateRef('AjaxUploaderRef');

const abort = (file: RcFile) => {
  uploader.value.abort(file);
};

defineExpose({
  abort,
});
</script>
<template>
  <AjaxUploader v-bind="{ ...props, ...falseToUndefined($attrs) }" ref="AjaxUploaderRef">
    <slot></slot>
  </AjaxUploader>
</template>
