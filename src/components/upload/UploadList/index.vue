<script lang="tsx" setup>
import type { CSSMotionListProps } from '@/vc-component/motion';
import CSSMotion, { CSSMotionList } from '@/vc-component/motion';
import useForceUpdate from '../../_util/hooks/useForceUpdate';
import initCollapseMotion from '../../_util/motion';
import type { ButtonProps } from '../../button';
import Button from '../../button';
import type { UploadFile, UploadListProps } from '../interface';
import { isImageUrl, previewImage } from '../utils';
import ListItem from './ListItem.vue';
import { computed, onMounted, ref, toRefs, watch, type VNode } from 'vue';
import { FileTwoTone, LoadingOutlined, PaperClipOutlined, PictureTwoTone } from '@ant-design/icons-vue';
import type { VueNode } from '@/vc-util/type';
import { cloneElement, isValidElement } from '@/vc-util/Children/util';
import Render from '@/vc-component/render';
import { useConfigContextInject } from '@/components/config-provider';
import clsx from 'clsx';
import { omit } from 'lodash-es';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  listType = 'text',
  previewFile = previewImage,
  onPreview,
  onDownload,
  onRemove,
  locale,
  iconRender,
  isImageUrl: isImgUrl = isImageUrl,
  prefixCls: customizePrefixCls,
  items = [],
  showPreviewIcon = true,
  showRemoveIcon = true,
  showDownloadIcon = false,
  removeIcon,
  previewIcon,
  downloadIcon,
  extra,
  progress = { size: [-1, 2], showInfo: false },
  appendAction,
  appendActionVisible = true,
  itemRender,
  disabled,
  classNames: uploadListClassNames,
  styles,
} = defineProps<UploadListProps>();

const forceUpdate = useForceUpdate();
const motionAppear = ref(false);
const isPictureCardOrCirle = computed(() => ['picture-card', 'picture-circle'].includes(listType));

// ============================= Effect =============================
watch([() => listType, () => items, () => previewFile], () => {
  if (!listType.startsWith('picture')) {
    return;
  }
  (items || []).forEach((file) => {
    if (!(file.originFileObj instanceof File || (file.originFileObj as any) instanceof Blob) || file.thumbUrl !== undefined) {
      return;
    }
    file.thumbUrl = '';
    previewFile?.(file.originFileObj as File).then((previewDataUrl: string) => {
      // Need append '' to avoid dead loop
      file.thumbUrl = previewDataUrl || '';
      forceUpdate();
    });
  });
});

onMounted(() => {
  motionAppear.value = true;
});

// ============================= Events =============================
const onInternalPreview = (file: UploadFile, e) => {
  if (!onPreview) {
    return;
  }
  e?.preventDefault();
  return onPreview(file);
};

const onInternalDownload = (file: UploadFile) => {
  if (typeof onDownload === 'function') {
    onDownload(file);
  } else if (file.url) {
    window.open(file.url);
  }
};

const onInternalClose = (file: UploadFile) => {
  onRemove?.(file);
};

const internalIconRender = (file: UploadFile) => {
  if (iconRender) {
    return iconRender(file, listType);
  }
  const isLoading = file.status === 'uploading';
  if (listType.startsWith('picture')) {
    const loadingIcon = listType === 'picture' ? <LoadingOutlined /> : locale.uploading;
    const fileIcon = isImgUrl?.(file) ? <PictureTwoTone /> : <FileTwoTone />;
    return isLoading ? loadingIcon : fileIcon;
  }
  return isLoading ? <LoadingOutlined /> : <PaperClipOutlined />;
};

const actionIconRender = (
  customIcon: VueNode,
  callback: () => void,
  prefixCls: string,
  title?: string,
  acceptUploadDisabled?: boolean,
) => {
  const btnProps: ButtonProps = {
    type: 'text',
    size: 'small',
    title,
    onClick: (e: MouseEvent) => {
      callback();
      if (isValidElement(customIcon)) {
        (customIcon as VNode).props?.onClick?.(e);
      }
    },
    class: `${prefixCls}-list-item-action`,
    disabled: acceptUploadDisabled ? disabled : false,
  };

  return isValidElement(customIcon) ? (
    <Button {...btnProps} icon={cloneElement(customIcon, { ...(customIcon as VNode).props, onClick: () => {} })} />
  ) : (
    <Button {...btnProps}>
      <span>
        <Render content={customIcon}></Render>
      </span>
    </Button>
  );
};

// ============================== Ref ===============================
// Test needs

defineExpose({
  handlePreview: onInternalPreview,
  handleDownload: onInternalDownload,
});

const { getPrefixCls } = toRefs(useConfigContextInject());

// ============================= Render =============================
const prefixCls = computed(() => getPrefixCls.value('upload', customizePrefixCls));
const rootPrefixCls = computed(() => getPrefixCls.value());

const listClassNames = computed(() =>
  clsx(`${prefixCls.value}-list`, `${prefixCls.value}-list-${listType}`, uploadListClassNames?.list),
);

const listItemMotion = computed(() => omit(initCollapseMotion(rootPrefixCls.value), ['onAppearEnd', 'onEnterEnd', 'onLeaveEnd']));
const motionConfig = computed<Omit<CSSMotionListProps, 'onVisibleChanged'>>(() => ({
  ...(isPictureCardOrCirle.value ? {} : listItemMotion.value),
  motionDeadline: 2000,
  motionName: `${prefixCls.value}-${isPictureCardOrCirle.value ? 'animate-inline' : 'animate'}`,
  keys: [...items.map((file) => ({ key: file.uid, file }))],
  motionAppear: motionAppear.value,
}));
</script>
<template>
  <div :class="listClassNames" :style="styles?.list">
    <CSSMotionList v-bind="motionConfig" :component="false">
      <template #default="{ key, file, class: motionClassName, style: motionStyle, ref: motionRef }">
        <ListItem
          :ref="motionRef"
          :key="key"
          :locale="locale"
          :prefix-cls="prefixCls"
          :class="motionClassName"
          :style="motionStyle"
          :class-names="uploadListClassNames"
          :styles="styles"
          :file="file"
          :items="items"
          :progress="progress"
          :list-type="listType"
          :is-img-url="isImgUrl"
          :show-preview-icon="showPreviewIcon"
          :show-remove-icon="showRemoveIcon"
          :show-download-icon="showDownloadIcon"
          :remove-icon="removeIcon"
          :preview-icon="previewIcon"
          :download-icon="downloadIcon"
          :extra="extra"
          :icon-render="internalIconRender"
          :action-icon-render="actionIconRender"
          :item-render="itemRender"
          @preview="onInternalPreview"
          @download="onInternalDownload"
          @close="onInternalClose"
        />
      </template>
    </CSSMotionList>
    <CSSMotion v-if="appendAction" :visible="appendActionVisible" force-render>
      <template #default="{ class: motionClassName, style: motionStyle, ref: motionRef }">
        <component
          :ref="motionRef"
          :is="
            cloneElement(appendAction, (oriProps) => ({
              class: clsx(oriProps.className, motionClassName),
              style: {
                ...motionStyle,
                // prevent the element has hover css pseudo-class that may cause animation to end prematurely.
                pointerEvents: motionClassName ? 'none' : undefined,
                ...oriProps.style,
              },
            }))
          "
        />
      </template>
    </CSSMotion>
  </div>
</template>
