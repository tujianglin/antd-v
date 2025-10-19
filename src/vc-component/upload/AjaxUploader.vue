<script lang="tsx" setup>
import pickAttrs from '@/vc-util/pickAttrs';
import { falseToUndefined } from '@/vc-util/props';
import clsx from 'clsx';
import { computed, onBeforeUnmount, onMounted, reactive, ref, useTemplateRef, watch } from 'vue';
import attrAccept from './attr-accept';
import type {
  BeforeUploadFileType,
  RcFile,
  UploadProgressEvent,
  UploadProps,
  UploadRequestError,
  UploadRequestOption,
} from './interface';
import defaultRequest from './request';
import traverseFileTree from './traverseFileTree';
import getUid from './uid';

interface ParsedFileInfo {
  origin?: RcFile;
  action?: string;
  data?: Record<string, unknown>;
  parsedFile?: RcFile;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  component: Tag,
  prefixCls,
  class: className,
  classNames = {},
  disabled,
  id,
  name,
  style,
  styles = {},
  multiple,
  accept,
  folder,
  openFileDialogOnClick,
  onMouseenter,
  onMouseleave,
  hasControlInside,
  ...otherProps
} = defineProps<UploadProps>();

const state = reactive({ uid: getUid() });

const reqs = ref<Record<string, any>>({});

const fileInput = useTemplateRef('fileInput');

const _isMounted = ref();

function onChange(e) {
  const { files } = e.target;
  const acceptedFiles = [...files].filter((file: RcFile) => !folder || attrAccept(file, accept));
  uploadFiles(acceptedFiles);
  reset();
}

function onClick(event: MouseEvent | KeyboardEvent) {
  const el = fileInput.value;
  if (!el) {
    return;
  }

  const target = event.target as HTMLElement;

  if (target && target.tagName === 'BUTTON') {
    const parent = el.parentNode as HTMLInputElement;
    parent.focus();
    target.blur();
  }
  el.click();
  if (otherProps.onClick) {
    otherProps.onClick(event);
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    onClick(e);
  }
}

async function onDataTransferFiles(dataTransfer: DataTransfer, existFileCallback?: () => void) {
  const items: DataTransferItem[] = [...(dataTransfer.items || [])];
  let files: File[] = [...(dataTransfer.files || [])];

  if (files.length > 0 || items.some((item) => item.kind === 'file')) {
    existFileCallback?.();
  }

  if (folder) {
    files = await traverseFileTree(Array.prototype.slice.call(items), (_file: RcFile) => attrAccept(_file, accept));
    uploadFiles(files);
  } else {
    // @ts-ignore
    let acceptFiles = [...files].filter((file: RcFile) => attrAccept(file, accept));

    if (multiple === false) {
      acceptFiles = files.slice(0, 1);
    }

    uploadFiles(acceptFiles);
  }
}

async function onFilePaste(e: ClipboardEvent) {
  if (!otherProps.pastable) {
    return;
  }

  if (e.type === 'paste') {
    const clipboardData = (e as ClipboardEvent).clipboardData;
    return onDataTransferFiles(clipboardData, () => {
      e.preventDefault();
    });
  }
}

function onFileDragOver(e: DragEvent) {
  e.preventDefault();
}

async function onFileDrop(e: DragEvent) {
  e.preventDefault();

  if (e.type === 'drop') {
    const dataTransfer = (e as DragEvent).dataTransfer;

    return onDataTransferFiles(dataTransfer);
  }
}

onMounted(() => {
  _isMounted.value = true;

  if (otherProps.pastable) {
    document.addEventListener('paste', onFilePaste);
  }
});

onBeforeUnmount(() => {
  _isMounted.value = false;
  abort();
  document.removeEventListener('paste', onFilePaste);
});

watch(
  () => otherProps.pastable,
  (val, oVal) => {
    if (val && !oVal) {
      document.addEventListener('paste', onFilePaste);
    } else if (!val && oVal) {
      document.removeEventListener('paste', onFilePaste);
    }
  },
);

function uploadFiles(files: File[]) {
  const originFiles = [...files] as RcFile[];
  const postFiles = originFiles.map((file: RcFile & { uid?: string }) => {
    file.uid = getUid();
    return processFile(file, originFiles);
  });

  // Batch upload files
  Promise.all(postFiles).then((fileList) => {
    otherProps.onBatchStart?.(fileList.map(({ origin, parsedFile }) => ({ file: origin, parsedFile })));

    fileList
      .filter((file) => file.parsedFile !== null)
      .forEach((file) => {
        post(file);
      });
  });
}

/**
 * Process file before upload. When all the file is ready, we start upload.
 */
async function processFile(file: RcFile, fileList: RcFile[]) {
  let transformedFile: BeforeUploadFileType | void = file;
  if (otherProps?.beforeUpload) {
    try {
      transformedFile = await otherProps?.beforeUpload(file, fileList);
    } catch {
      // Rejection will also trade as false
      transformedFile = false;
    }
    if (transformedFile === false) {
      return {
        origin: file,
        parsedFile: null,
        action: null,
        data: null,
      };
    }
  }

  // Get latest action
  let mergedAction: string;
  if (typeof otherProps?.action === 'function') {
    mergedAction = await otherProps?.action(file);
  } else {
    mergedAction = otherProps?.action;
  }

  // Get latest data
  let mergedData: Record<string, unknown>;
  if (typeof otherProps?.data === 'function') {
    mergedData = await otherProps?.data(file);
  } else {
    mergedData = otherProps?.data;
  }

  const parsedData =
    // string type is from legacy `transformFile`.
    // Not sure if this will work since no related test case works with it
    (typeof transformedFile === 'object' || typeof transformedFile === 'string') && transformedFile ? transformedFile : file;

  let parsedFile: File;
  if (parsedData instanceof File) {
    parsedFile = parsedData;
  } else {
    parsedFile = new File([parsedData], file.name, { type: file.type });
  }

  const mergedParsedFile: RcFile = parsedFile as RcFile;
  mergedParsedFile.uid = file.uid;

  return {
    origin: file,
    data: mergedData,
    parsedFile: mergedParsedFile,
    action: mergedAction,
  };
}

function post({ data, origin, action, parsedFile }: ParsedFileInfo) {
  if (!_isMounted.value) {
    return;
  }

  const { uid } = origin;
  const request = otherProps.customRequest || defaultRequest;

  const requestOption = {
    action,
    filename: name,
    data,
    file: parsedFile,
    headers: otherProps.headers,
    withCredentials: otherProps.withCredentials,
    method: otherProps.method || 'post',
    onProgress: (e: UploadProgressEvent) => {
      otherProps.onProgress?.(e, parsedFile);
    },
    onSuccess: (ret: any, xhr: XMLHttpRequest) => {
      otherProps.onSuccess?.(ret, parsedFile, xhr);

      delete reqs.value[uid];
    },
    onError: (err: UploadRequestError, ret: any) => {
      otherProps.onError?.(err, ret, parsedFile);

      delete reqs.value[uid];
    },
  } as UploadRequestOption;

  otherProps.onStart(origin);
  reqs.value[uid] = request(requestOption);
}

function reset() {
  state.uid = getUid();
}

function abort(file?: any) {
  if (file) {
    const uid = file.uid ? file.uid : file;
    if (reqs.value[uid] && reqs.value[uid].abort) {
      reqs.value[uid].abort();
    }
    delete reqs.value[uid];
  } else {
    Object.keys(reqs.value).forEach((uid) => {
      if (reqs.value[uid] && reqs.value[uid].abort) {
        reqs.value[uid].abort();
      }
      delete reqs.value[uid];
    });
  }
}

defineExpose({
  abort,
});

const cls = computed(() =>
  clsx({
    [prefixCls]: true,
    [`${prefixCls}-disabled`]: disabled,
    [className]: className,
  }),
);

// because input don't have directory/webkitdirectory type declaration
const dirProps = computed(() => (folder ? { directory: 'directory', webkitdirectory: 'webkitdirectory' } : {}));
const events = computed(() =>
  disabled
    ? {}
    : {
        onClick: openFileDialogOnClick ? onClick : () => {},
        onKeydown: openFileDialogOnClick ? onKeydown : () => {},
        onMouseenter,
        onMouseleave,
        onDrop: onFileDrop,
        onDragover: onFileDragOver,
        tabindex: hasControlInside ? undefined : '0',
      },
);
</script>
<template>
  <component :is="Tag" v-bind="events" :class="cls" :role="hasControlInside ? undefined : 'button'" :style="style">
    <input
      v-bind="{
        ...pickAttrs(otherProps, { aria: true, data: true }),
        ...dirProps,
        ...falseToUndefined($attrs),
        ...($attrs.capture !== null ? { capture: $attrs.capture } : {}),
      }"
      :id="id"
      :name="name"
      :disabled="disabled"
      type="file"
      ref="fileInput"
      @click="(e) => e.stopPropagation()"
      :key="state.uid"
      :style="{ display: 'none', ...styles.input }"
      :class="classNames.input"
      :accept="accept"
      :multiple="multiple"
      @change="onChange"
    />
    <slot></slot>
  </component>
</template>
