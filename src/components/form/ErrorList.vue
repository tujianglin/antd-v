<script lang="tsx" setup>
import type { CSSMotionProps } from '@/vc-component/motion';
import CSSMotion, { CSSMotionList } from '@/vc-component/motion';
import clsx from 'clsx';
import { computed, toRefs, watch } from 'vue';

import type { VueNode } from '@/vc-util/type';
import { ref } from 'vue';
import initCollapseMotion from '../_util/motion';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { useFormItemPrefixContextInject } from './context';
import type { ValidateStatus } from './FormItem';
import useDebounce from './hooks/useDebounce';
import useStyle from './style';

interface ErrorEntity {
  error: VueNode | boolean;
  errorStatus?: ValidateStatus;
  key: string;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  help,
  helpStatus,
  errors = [],
  warnings = [],
  class: rootClassName,
  fieldId,
  onVisibleChanged,
} = defineProps<ErrorListProps>();

export interface ErrorListProps {
  fieldId?: string;
  help?: VueNode;
  helpStatus?: ValidateStatus;
  errors?: VueNode[];
  warnings?: VueNode[];
  class?: string;
  onVisibleChanged?: (visible: boolean) => void;
}

const { prefixCls } = toRefs(useFormItemPrefixContextInject());

const baseClassName = computed(() => `${prefixCls.value}-item-explain`);

const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

const collapseMotion = computed<CSSMotionProps>(() => initCollapseMotion(prefixCls.value));

// Debounce errors and warnings
const errorsRef = ref(errors);
const warningsRef = ref(warnings);

watch(
  () => errors,
  (newErrors) => {
    errorsRef.value = newErrors;
  },
  { immediate: true },
);

watch(
  () => warnings,
  (newWarnings) => {
    warningsRef.value = newWarnings;
  },
  { immediate: true },
);

const debounceErrors = useDebounce(errorsRef);
const debounceWarnings = useDebounce(warningsRef);

function toErrorEntity(error: VueNode | boolean, prefix: string, errorStatus?: ValidateStatus, index = 0): ErrorEntity {
  return {
    key: typeof error === 'string' ? error : `${prefix}-${index}`,
    error,
    errorStatus,
  };
}

const fullKeyList = computed<ErrorEntity[]>(() => {
  if (help !== undefined && help !== null) {
    return [toErrorEntity(help, 'help', helpStatus)];
  }

  return [
    ...debounceErrors.value.map((error, index) => toErrorEntity(error, 'error', 'error', index)),
    ...debounceWarnings.value.map((warning, index) => toErrorEntity(warning, 'warning', 'warning', index)),
  ];
});

const filledKeyFullKeyList = computed<ErrorEntity[]>(() => {
  const keysCount: Record<string, number> = {};
  fullKeyList.value.forEach(({ key }) => {
    keysCount[key] = (keysCount[key] || 0) + 1;
  });
  return fullKeyList.value.map((entity, index) => ({
    ...entity,
    key: keysCount[entity.key] > 1 ? `${entity.key}-fallback-${index}` : entity.key,
  }));
});

const helpProps = computed(() => {
  const result: { id?: string } = {};
  if (fieldId) {
    result.id = `${fieldId}_help`;
  }
  return result;
});
</script>

<template>
  <CSSMotion
    :motion-deadline="collapseMotion.motionDeadline"
    :motion-name="`${prefixCls}-show-help`"
    :visible="!!filledKeyFullKeyList.length"
    :on-visible-changed="onVisibleChanged"
  >
    <template #default="{ class: holderClassName, style: holderStyle, ref: montionRef }">
      <div
        :ref="montionRef"
        v-bind="helpProps"
        :class="clsx(baseClassName, holderClassName, cssVarCls, rootCls, rootClassName, hashId)"
        :style="holderStyle"
      >
        <CSSMotionList
          :keys="filledKeyFullKeyList"
          v-bind="initCollapseMotion(prefixCls)"
          :motion-name="`${prefixCls}-show-help-item`"
          :component="false"
        >
          <template #default="{ key, error, errorStatus, class: itemClassName, style: itemStyle, ref: motionRef1 }">
            <div
              :ref="motionRef1"
              :key="key"
              :class="
                clsx(itemClassName, {
                  [`${baseClassName}-${errorStatus}`]: errorStatus,
                })
              "
              :style="itemStyle"
            >
              {{ error ? error : '' }}
            </div>
          </template>
        </CSSMotionList>
      </div>
    </template>
  </CSSMotion>
</template>
