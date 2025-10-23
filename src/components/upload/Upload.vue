<script lang="tsx" setup>
import type { UploadProps as RcUploadProps } from '@/vc-component/upload';
import RcUpload from '@/vc-component/upload';

import { useComponentConfig } from '../config-provider/context';
import { useLocale } from '../locale';
import defaultLocale from '../locale/en_US';
import type { RcFile, ShowUploadListInterface, UploadChangeParam, UploadFile, UploadProps } from './interface';
import useStyle from './style';
import UploadList from './UploadList/index.vue';
import { file2Obj, getFileItem, removeFileItem, updateFileList } from './utils';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import { computed, getCurrentInstance, nextTick, ref, toRefs, watch, type VNode } from 'vue';
import useControlledState from '@/vc-util/hooks/useControlledState';
import { reactiveComputed } from '@vueuse/core';
import type { VueNode } from '@/vc-util/type';
import Render from '@/vc-component/render';
import clsx from 'clsx';

export type { UploadProps };

export interface UploadRef<T = any> {
  onBatchStart: RcUploadProps['onBatchStart'];
  onSuccess: (response: any, file: RcFile, xhr: any) => void;
  onProgress: (e: { percent: number }, file: RcFile) => void;
  onError: (error: Error, response: any, file: RcFile) => void;
  fileList: UploadFile<T>[];
  upload: typeof RcUpload | null;
  /**
   * Get native element for wrapping upload
   * @since 5.17.0
   */
  nativeElement: HTMLSpanElement | null;
}

defineOptions({ name: 'Upload', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  onRemove,
  showUploadList = true,
  listType = 'text',
  onPreview,
  onDownload,
  onChange,
  onDrop,
  previewFile,
  disabled: customDisabled,
  locale: propLocale,
  iconRender,
  isImageUrl,
  progress,
  prefixCls: customizePrefixCls,
  class: className,
  type = 'select',
  style,
  itemRender,
  maxCount,
  data = {},
  multiple = false,
  hasControlInside = true,
  action = '',
  accept = '',
  supportServerRender = true,
  rootClassName,
  styles,
  classNames: uploadClassNames,
  // eslint-disable-next-line unused-imports/no-unused-vars, no-unused-vars
  openFileDialogOnClick = true,
  ...resetProps
} = defineProps<UploadProps>();

const slots = defineSlots<{
  default: () => VNode[];
}>();

const fileList = defineModel<Array<UploadFile<any>>>('fileList', { default: [] });

const LIST_IGNORE = `__LIST_IGNORE_${Date.now()}__`;

const config = useComponentConfig('upload');

// ===================== Disabled =====================
const disabled = useDisabledContextInject();
const mergedDisabled = computed(() => customDisabled ?? disabled?.value);

const customRequest = computed(() => resetProps.customRequest || config.customRequest);

const [mergedFileList, setMergedFileList] = useControlledState([], fileList);

const dragState = ref<string>('drop');

const upload = ref<typeof RcUpload>(null);
const wrapRef = ref<HTMLSpanElement>(null);

// Control mode will auto fill file uid if not provided
watch(fileList, () => {
  const timestamp = Date.now();

  (fileList.value || []).forEach((file, index) => {
    if (!file.uid && !Object.isFrozen(file)) {
      file.uid = `__AUTO__${timestamp}_${index}__`;
    }
  });
});

const onInternalChange = (file: UploadFile, changedFileList: UploadFile[], event?: { percent: number }) => {
  let cloneList = [...changedFileList];

  let exceedMaxCount = false;

  // Cut to match count
  if (maxCount === 1) {
    cloneList = cloneList.slice(-1);
  } else if (maxCount) {
    exceedMaxCount = cloneList.length > maxCount;
    cloneList = cloneList.slice(0, maxCount);
  }

  // Prevent React18 auto batch since input[upload] trigger process at same time
  // which makes fileList closure problem
  nextTick(() => {
    setMergedFileList(cloneList);
  });

  const changeInfo: UploadChangeParam<UploadFile> = {
    file: file as UploadFile,
    fileList: cloneList,
  };

  if (event) {
    changeInfo.event = event;
  }

  if (
    !exceedMaxCount ||
    file.status === 'removed' ||
    // We should ignore event if current file is exceed `maxCount`
    cloneList.some((f) => f.uid === file.uid)
  ) {
    nextTick(() => {
      fileList.value = changeInfo?.fileList;
      onChange?.(changeInfo);
    });
  }
};

const mergedBeforeUpload = async (file: RcFile, fileListArgs: RcFile[]) => {
  const { beforeUpload } = resetProps;

  let parsedFile: File | Blob | string = file;
  if (beforeUpload) {
    const result = await beforeUpload(file, fileListArgs);

    if (result === false) {
      return false;
    }

    // Hack for LIST_IGNORE, we add additional info to remove from the list
    delete (file as any)[LIST_IGNORE];
    if ((result as any) === LIST_IGNORE) {
      Object.defineProperty(file, LIST_IGNORE, {
        value: true,
        configurable: true,
      });
      return false;
    }

    if (typeof result === 'object' && result) {
      parsedFile = result as File;
    }
  }

  return parsedFile as RcFile;
};

const onBatchStart: RcUploadProps['onBatchStart'] = (batchFileInfoList) => {
  // Skip file which marked as `LIST_IGNORE`, these file will not add to file list
  const filteredFileInfoList = batchFileInfoList.filter((info) => !(info.file as any)[LIST_IGNORE]);

  // Nothing to do since no file need upload
  if (!filteredFileInfoList.length) {
    return;
  }

  const objectFileList = filteredFileInfoList.map((info) => file2Obj(info.file as RcFile));

  // Concat new files with prev files
  let newFileList = [...mergedFileList.value];

  objectFileList.forEach((fileObj) => {
    // Replace file if exist
    newFileList = updateFileList(fileObj, newFileList);
  });

  objectFileList.forEach((fileObj, index) => {
    // Repeat trigger `onChange` event for compatible
    let triggerFileObj: UploadFile = fileObj;

    if (!filteredFileInfoList[index].parsedFile) {
      // `beforeUpload` return false
      const { originFileObj } = fileObj;
      let clone: UploadFile;

      try {
        clone = new File([originFileObj], originFileObj.name, {
          type: originFileObj.type,
        }) as any as UploadFile;
      } catch {
        clone = new Blob([originFileObj], {
          type: originFileObj.type,
        }) as any as UploadFile;
        clone.name = originFileObj.name;
        clone.lastModifiedDate = new Date();
        clone.lastModified = new Date().getTime();
      }

      clone.uid = fileObj.uid;
      triggerFileObj = clone;
    } else {
      // Inject `uploading` status
      fileObj.status = 'uploading';
    }

    onInternalChange(triggerFileObj, newFileList);
  });
};

const onSuccess = (response: any, file: RcFile, xhr: any) => {
  try {
    if (typeof response === 'string') {
      response = JSON.parse(response);
    }
  } catch {
    /* do nothing */
  }

  // removed
  if (!getFileItem(file, mergedFileList.value)) {
    return;
  }

  const targetItem = file2Obj(file);
  targetItem.status = 'done';
  targetItem.percent = 100;
  targetItem.response = response;
  targetItem.xhr = xhr;

  const nextFileList = updateFileList(targetItem, mergedFileList.value);

  onInternalChange(targetItem, nextFileList);
};

const onProgress = (e: { percent: number }, file: RcFile) => {
  // removed
  if (!getFileItem(file, mergedFileList.value)) {
    return;
  }

  const targetItem = file2Obj(file);
  targetItem.status = 'uploading';
  targetItem.percent = e.percent;

  const nextFileList = updateFileList(targetItem, mergedFileList.value);

  onInternalChange(targetItem, nextFileList, e);
};

const onError = (error: Error, response: any, file: RcFile) => {
  // removed
  if (!getFileItem(file, mergedFileList.value)) {
    return;
  }

  const targetItem = file2Obj(file);
  targetItem.error = error;
  targetItem.response = response;
  targetItem.status = 'error';

  const nextFileList = updateFileList(targetItem, mergedFileList.value);

  onInternalChange(targetItem, nextFileList);
};

const handleRemove = (file: UploadFile<any>) => {
  let currentFile: UploadFile;
  Promise.resolve(typeof onRemove === 'function' ? onRemove(file) : onRemove).then((ret) => {
    // Prevent removing file
    if (ret === false) {
      return;
    }

    const removedFileList = removeFileItem(file, mergedFileList.value);

    if (removedFileList) {
      currentFile = { ...file, status: 'removed' };
      mergedFileList.value?.forEach((item) => {
        const matchKey = currentFile.uid !== undefined ? 'uid' : 'name';
        if (item[matchKey] === currentFile[matchKey] && !Object.isFrozen(item)) {
          item.status = 'removed';
        }
      });
      upload.value?.abort(currentFile as RcFile);

      onInternalChange(currentFile, removedFileList);
    }
  });
};

const onFileDrop = (e: DragEvent) => {
  dragState.value = e.type;

  if (e.type === 'drop') {
    onDrop?.(e);
  }
};

// Test needs
defineExpose({
  onBatchStart,
  onSuccess,
  onProgress,
  onError,
  get fileList() {
    return mergedFileList.value;
  },
  get upload() {
    return upload.value;
  },
  get nativeElement() {
    return wrapRef.value;
  },
});

const {
  getPrefixCls,
  direction,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('upload'));

const prefixCls = computed(() => getPrefixCls.value('upload', customizePrefixCls));

const vm = getCurrentInstance();

const rcUploadProps = computed(() => {
  const result = {
    onBatchStart,
    onError,
    onProgress,
    onSuccess,
    ...vm.props,
    customRequest: customRequest.value,
    data,
    multiple,
    action,
    accept,
    supportServerRender,
    prefixCls: prefixCls.value,
    disabled: mergedDisabled.value,
    beforeUpload: mergedBeforeUpload,
    onChange: undefined,
    hasControlInside,
  } as any;

  delete result.class;
  delete result.style;

  // Remove id to avoid open by label when trigger is hidden
  // !children: https://github.com/ant-design/ant-design/issues/14298
  // disabled: https://github.com/ant-design/ant-design/issues/16478
  //           https://github.com/ant-design/ant-design/issues/24197
  if (!slots.default?.() || mergedDisabled.value) {
    delete result.id;
  }
  return result;
});

const wrapperCls = computed(() => `${prefixCls.value}-wrapper`);
const [hashId, cssVarCls] = useStyle(prefixCls, wrapperCls);

const [contextLocale] = useLocale('Upload', defaultLocale.Upload);

const { showRemoveIcon, showPreviewIcon, showDownloadIcon, removeIcon, previewIcon, downloadIcon, extra } = toRefs(
  reactiveComputed(() => (typeof showUploadList === 'boolean' ? ({} as ShowUploadListInterface) : showUploadList)),
);

// use showRemoveIcon if it is specified explicitly
const realShowRemoveIcon = computed(() =>
  typeof showRemoveIcon?.value === 'undefined' ? !mergedDisabled.value : showRemoveIcon?.value,
);

const renderUploadList = (button?: VueNode, buttonVisible?: boolean) => {
  if (!showUploadList) {
    return <Render content={button}></Render>;
  }
  return (
    <UploadList
      classNames={{
        list: clsx(contextClassNames?.value?.list, uploadClassNames?.list),
        item: clsx(contextClassNames?.value?.item, uploadClassNames?.item),
      }}
      styles={{
        list: { ...contextStyles?.value?.list, ...styles?.list },
        item: { ...contextStyles?.value?.item, ...styles?.item },
      }}
      prefixCls={prefixCls.value}
      listType={listType}
      items={mergedFileList.value}
      previewFile={previewFile}
      onPreview={onPreview}
      onDownload={onDownload}
      onRemove={handleRemove}
      showRemoveIcon={realShowRemoveIcon.value}
      showPreviewIcon={showPreviewIcon?.value}
      showDownloadIcon={showDownloadIcon?.value}
      removeIcon={removeIcon?.value}
      previewIcon={previewIcon?.value}
      downloadIcon={downloadIcon?.value}
      iconRender={iconRender}
      extra={extra?.value}
      locale={{ ...contextLocale?.value, ...propLocale }}
      isImageUrl={isImageUrl}
      progress={progress}
      appendAction={button}
      appendActionVisible={buttonVisible}
      itemRender={itemRender}
      disabled={mergedDisabled.value}
    />
  );
};

const mergedRootCls = computed(() =>
  clsx(
    wrapperCls.value,
    className,
    rootClassName,
    hashId.value,
    cssVarCls.value,
    contextClassName?.value,
    contextClassNames?.value?.root,
    uploadClassNames?.root,
    {
      [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
      [`${prefixCls.value}-picture-card-wrapper`]: listType === 'picture-card',
      [`${prefixCls.value}-picture-circle-wrapper`]: listType === 'picture-circle',
    },
  ),
);
const mergedRootStyle = computed(() => ({ ...contextStyles?.value?.root, ...styles?.root }));

const mergedStyle = computed(() => ({ ...contextStyle?.value, ...style }));

// ======================== Render ========================

const dragCls = computed(() =>
  clsx(hashId.value, prefixCls.value, `${prefixCls.value}-drag`, {
    [`${prefixCls.value}-drag-uploading`]: mergedFileList.value.some((file) => file.status === 'uploading'),
    [`${prefixCls.value}-drag-hover`]: dragState.value === 'dragover',
    [`${prefixCls.value}-disabled`]: mergedDisabled.value,
    [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
  }),
);

const uploadBtnCls = computed(() =>
  clsx(prefixCls.value, `${prefixCls.value}-select`, {
    [`${prefixCls.value}-disabled`]: mergedDisabled.value,
    [`${prefixCls.value}-hidden`]: !slots.default,
  }),
);

const UploadButton = () => (
  <div class={uploadBtnCls.value} style={mergedStyle.value}>
    <RcUpload {...rcUploadProps.value} ref={upload}>
      {slots.default?.()}
    </RcUpload>
  </div>
);
</script>
<template>
  <span v-if="type === 'drag'" :class="mergedRootCls" ref="wrapRef" :style="mergedRootStyle">
    <div :class="dragCls" :style="mergedStyle" @drop="onFileDrop" @dragover="onFileDrop" @dragleave="onFileDrop">
      <RcUpload v-bind="rcUploadProps" ref="upload" :class="`${prefixCls}-btn`">
        <div :class="`${prefixCls}-drag-container`">
          <slot></slot>
        </div>
      </RcUpload>
    </div>
  </span>
  <span
    v-else-if="listType === 'picture-card' || listType === 'picture-circle'"
    :class="mergedRootCls"
    ref="wrapRef"
    :style="mergedRootStyle"
  >
    <component :is="renderUploadList(UploadButton, !!slots.default)" />
  </span>
  <span v-else :class="mergedRootCls" ref="wrapRef" :style="mergedRootStyle">
    <UploadButton />
    <component :is="renderUploadList()" />
  </span>
</template>
