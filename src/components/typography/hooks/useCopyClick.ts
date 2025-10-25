import { flattenChildren } from '@/vc-util/Dom/findDOMNode';
import type { VueNode } from '@/vc-util/type';
import copy from 'copy-to-clipboard';
import { onMounted, ref, type Ref } from 'vue';
import toList from '../../_util/toList';
import type { CopyConfig } from '../Base/index.vue';

const useCopyClick = (copyConfig: Ref<CopyConfig>, children?: Ref<VueNode>) => {
  const copied = ref(false);

  const copyLoading = ref(false);

  const copyIdRef = ref<ReturnType<typeof setTimeout> | null>(null);

  const cleanCopyId = () => {
    if (copyIdRef.value) {
      clearTimeout(copyIdRef.value);
    }
  };

  const copyOptions: Pick<CopyConfig, 'format'> = {};
  if (copyConfig.value.format) {
    copyOptions.format = copyConfig.value.format;
  }

  onMounted(() => cleanCopyId);

  // Keep copy action up to date
  const onClick = async (e?: MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    copyLoading.value = true;
    try {
      const text = typeof copyConfig.value.text === 'function' ? await copyConfig.value.text() : copyConfig.value.text;
      copy(
        text ||
          toList(flattenChildren([children.value]), true)
            .map((i) => i?.children)
            .join('') ||
          '',
        copyOptions,
      );
      copyLoading.value = false;

      copied.value = true;

      // Trigger tips update
      cleanCopyId();
      copyIdRef.value = setTimeout(() => {
        copied.value = false;
      }, 3000);
      copyConfig.value.onCopy?.(e);
    } catch (error) {
      copyLoading.value = false;
      throw error;
    }
  };

  return {
    copied,
    copyLoading,
    onClick,
  };
};

export default useCopyClick;
