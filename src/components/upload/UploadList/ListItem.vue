<script lang="tsx" setup>
import CSSMotion from '@/vc-component/motion';
import Progress from '../../progress';
import Tooltip from '../../tooltip';
import type { ItemRender, SemanticName, UploadFile, UploadListProgressProps, UploadListType, UploadLocale } from '../interface';
import { computed, onBeforeUnmount, onMounted, ref, toRefs, watch, type CSSProperties } from 'vue';
import type { VueNode } from '@/vc-util/type';
import { reactiveComputed } from '@vueuse/core';
import clsx from 'clsx';
import { DeleteOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons-vue';
import { useConfigContextInject } from '../../config-provider';
import Render from '@/vc-component/render';

export interface ListItemProps {
  prefixCls: string;
  class?: string;
  style?: CSSProperties;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  locale: UploadLocale;
  file: UploadFile;
  items: UploadFile[];
  listType?: UploadListType;
  isImgUrl?: (file: UploadFile) => boolean;
  showRemoveIcon?: boolean | ((file: UploadFile) => boolean);
  showDownloadIcon?: boolean | ((file: UploadFile) => boolean);
  showPreviewIcon?: boolean | ((file: UploadFile) => boolean);
  removeIcon?: VueNode | ((file: UploadFile) => VueNode);
  downloadIcon?: VueNode | ((file: UploadFile) => VueNode);
  previewIcon?: VueNode | ((file: UploadFile) => VueNode);
  extra?: VueNode | ((file: UploadFile) => VueNode);
  iconRender: (file: UploadFile) => VueNode;
  actionIconRender: (
    customIcon: VueNode,
    callback: () => void,
    prefixCls: string,
    title?: string,
    acceptUploadDisabled?: boolean,
  ) => VueNode;
  itemRender?: ItemRender;
  onPreview: (file: UploadFile, e) => void;
  onClose: (file: UploadFile) => void;
  onDownload: (file: UploadFile) => void;
  progress?: UploadListProgressProps;
}

const {
  prefixCls,
  class: className,
  style,
  classNames: itemClassNames,
  styles,
  locale,
  listType,
  file,
  items,
  progress: progressProps,
  iconRender,
  actionIconRender,
  itemRender,
  isImgUrl,
  showPreviewIcon,
  showRemoveIcon,
  showDownloadIcon,
  previewIcon: customPreviewIcon,
  removeIcon: customRemoveIcon,
  downloadIcon: customDownloadIcon,
  extra: customExtra,
  onPreview,
  onDownload,
  onClose,
} = defineProps<ListItemProps>();

// Status: which will ignore `removed` status
const { status } = toRefs(reactiveComputed(() => file));
const mergedStatus = ref(status.value);
watch(
  status,
  () => {
    if (status.value !== 'removed') {
      mergedStatus.value = status.value;
    }
  },
  { immediate: true },
);

// Delay to show the progress bar
const showProgress = ref(false);
let timer;
onMounted(() => {
  timer = setTimeout(() => {
    showProgress.value = true;
  }, 300);
});
onBeforeUnmount(() => {
  clearTimeout(timer);
});

const Icon = () => {
  const iconNode = iconRender(file);
  let icon = (
    <div class={`${prefixCls}-icon`}>
      <Render content={iconNode}></Render>
    </div>
  );
  if (listType === 'picture' || listType === 'picture-card' || listType === 'picture-circle') {
    if (mergedStatus.value === 'uploading' || (!file.thumbUrl && !file.url)) {
      const uploadingClassName = clsx(`${prefixCls}-list-item-thumbnail`, {
        [`${prefixCls}-list-item-file`]: mergedStatus.value !== 'uploading',
      });
      icon = (
        <div class={uploadingClassName}>
          <Render content={iconNode}></Render>
        </div>
      );
    } else {
      const thumbnail = isImgUrl?.(file) ? (
        <img
          src={file.thumbUrl || file.url}
          alt={file.name}
          class={`${prefixCls}-list-item-image`}
          crossorigin={file.crossorigin}
        />
      ) : (
        <Render content={iconNode}></Render>
      );
      const aClassName = clsx(`${prefixCls}-list-item-thumbnail`, {
        [`${prefixCls}-list-item-file`]: isImgUrl && !isImgUrl(file),
      });
      icon = (
        <a
          class={aClassName}
          onClick={(e) => onPreview(file, e)}
          href={file.url || file.thumbUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {thumbnail}
        </a>
      );
    }
  }
  return icon;
};

const listItemClassName = computed(() =>
  clsx(`${prefixCls}-list-item`, `${prefixCls}-list-item-${mergedStatus.value}`, itemClassNames?.item),
);
const linkProps = computed(() => (typeof file.linkProps === 'string' ? JSON.parse(file.linkProps) : file.linkProps));

const removeIcon = () =>
  (typeof showRemoveIcon === 'function' ? showRemoveIcon(file) : showRemoveIcon)
    ? actionIconRender(
        (typeof customRemoveIcon === 'function' ? (customRemoveIcon as any)(file) : customRemoveIcon) || <DeleteOutlined />,
        () => onClose(file),
        prefixCls,
        locale.removeFile,
        // acceptUploadDisabled is true, only remove icon will follow Upload disabled prop
        // https://github.com/ant-design/ant-design/issues/46171
        true,
      )
    : null;

const downloadIcon = () =>
  (typeof showDownloadIcon === 'function' ? showDownloadIcon(file) : showDownloadIcon) && mergedStatus.value === 'done'
    ? actionIconRender(
        (typeof customDownloadIcon === 'function' ? (customDownloadIcon as any)?.(file) : customDownloadIcon) || (
          <DownloadOutlined />
        ),
        () => onDownload(file),
        prefixCls,
        locale.downloadFile,
      )
    : null;
const DownloadOrDelete = () =>
  listType !== 'picture-card' &&
  listType !== 'picture-circle' && (
    <span
      key="download-delete"
      class={clsx(`${prefixCls}-list-item-actions`, {
        picture: listType === 'picture',
      })}
    >
      <Render content={removeIcon}></Render>
      <Render content={downloadIcon}></Render>
    </span>
  );

const extraContent = computed(() => (typeof customExtra === 'function' ? (customExtra as any)?.(file) : customExtra));
const Extra = () =>
  extraContent.value && (
    <span class={`${prefixCls}-list-item-extra`}>
      <Render content={extraContent.value}></Render>
    </span>
  );

const listItemNameClass = computed(() => clsx(`${prefixCls}-list-item-name`));
const FileName = () =>
  file.url ? (
    <a
      key="view"
      target="_blank"
      rel="noopener noreferrer"
      class={listItemNameClass.value}
      title={file.name}
      {...linkProps.value}
      href={file.url}
      onClick={(e) => onPreview(file, e)}
    >
      {file.name}
      <Extra></Extra>
    </a>
  ) : (
    <span key="view" class={listItemNameClass.value} onClick={(e) => onPreview(file, e)} title={file.name}>
      {file.name}
      <Extra></Extra>
    </span>
  );

const PreviewIcon = () =>
  (typeof showPreviewIcon === 'function' ? showPreviewIcon(file) : showPreviewIcon) && (file.url || file.thumbUrl) ? (
    <a
      href={file.url || file.thumbUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => onPreview(file, e)}
      title={locale.previewFile}
    >
      {typeof customPreviewIcon === 'function' ? (customPreviewIcon as any)?.(file) : customPreviewIcon || <EyeOutlined />}
    </a>
  ) : null;

const PictureCardActions = () =>
  (listType === 'picture-card' || listType === 'picture-circle') &&
  mergedStatus.value !== 'uploading' && (
    <span class={`${prefixCls}-list-item-actions`}>
      <PreviewIcon></PreviewIcon>
      {mergedStatus.value === 'done' && <Render content={downloadIcon}></Render>}
      <Render content={removeIcon}></Render>
    </span>
  );

const { getPrefixCls } = toRefs(useConfigContextInject());
const rootPrefixCls = computed(() => getPrefixCls.value());

const Dom = () => (
  <div class={listItemClassName.value} style={styles?.item}>
    <Icon></Icon>
    <FileName></FileName>
    <DownloadOrDelete></DownloadOrDelete>
    <PictureCardActions></PictureCardActions>
    {showProgress.value && (
      <CSSMotion motionName={`${rootPrefixCls.value}-fade`} visible={mergedStatus.value === 'uploading'} motionDeadline={2000}>
        {{
          default: ({ className: motionClassName, ref: motionRef }) => {
            // show loading icon if upload progress listener is disabled
            const loadingProgress =
              'percent' in file ? (
                <Progress
                  type="line"
                  percent={file.percent}
                  aria-label={file['aria-label']}
                  aria-labelledby={file['aria-labelledby']}
                  {...progressProps}
                />
              ) : null;

            return (
              <div ref={motionRef} class={clsx(`${prefixCls}-list-item-progress`, motionClassName)}>
                {loadingProgress}
              </div>
            );
          },
        }}
      </CSSMotion>
    )}
  </div>
);

const message = computed(() =>
  file.response && typeof file.response === 'string'
    ? file.response
    : file.error?.statusText || file.error?.message || locale.uploadError,
);

const Item = () =>
  mergedStatus.value === 'error' ? (
    <Tooltip title={message.value} getPopupContainer={(node) => node.parentNode as HTMLElement}>
      <Dom></Dom>
    </Tooltip>
  ) : (
    <Dom></Dom>
  );
</script>
<template>
  <div :class="clsx(`${prefixCls}-list-item-container`, className)" :style="style">
    <Render
      v-if="itemRender"
      :content="itemRender(Item, file, items, {
         download: onDownload.bind(null, file),
         preview: onPreview.bind(null, file) as any,
         remove: onClose.bind(null, file),
       })"
    />
    <Item v-else />
  </div>
</template>
