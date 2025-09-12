<script lang="tsx" setup>
import { computed, nextTick, onBeforeUnmount, toRefs, useTemplateRef, watch } from 'vue';
import { floatButtonPrefixCls, type FloatButtonGroupProps } from './interface';
import { useComponentConfig } from '../config-provider/context';
import { CloseOutlined, FileTextOutlined } from '@ant-design/icons-vue';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useStyle from './style';
import useMergeSemantic from '../_util/hooks/useMergeSemantic';
import { useZIndex } from '../_util/hooks/useZIndex';
import clsx from 'clsx';
import FloatButton from './FloatButton.vue';
import Flex from '../flex';
import Space from '../space';
import { GroupContextProvider } from './context';
import CSSMotion from '@/vc-component/motion';

defineOptions({ name: 'FloatButtonGroup', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  style,
  classNames,
  styles,
  rootClassName,

  shape = 'circle',
  type = 'default',
  placement,
  icon = <FileTextOutlined></FileTextOutlined>,
  closeIcon,
  trigger,
  onOpenChange,
  onClick: onTriggerButtonClick,
  ariaLabel,
  ...floatButtonProps
} = defineProps<FloatButtonGroupProps>();

const {
  direction,
  getPrefixCls,
  closeIcon: contextCloseIcon,
  classNames: contextClassNames,
  styles: contextStyles,
  class: contextClassName,
  style: contextStyle,
} = toRefs(useComponentConfig('floatButtonGroup'));

const mergedCloseIcon = computed(() => closeIcon ?? contextCloseIcon?.value ?? <CloseOutlined />);

const prefixCls = computed(() => getPrefixCls.value(floatButtonPrefixCls, customizePrefixCls));
const rootCls = useCSSVarCls(prefixCls);

const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

const groupPrefixCls = computed(() => `${prefixCls.value}-group`);

const isMenuMode = computed(() => trigger && ['click', 'hover'].includes(trigger));

const [mergedClassNames, mergedStyles] = useMergeSemantic(
  computed(() => [contextClassNames?.value, classNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({
    item: {
      _default: 'root',
    },
    trigger: {
      _default: 'root',
    },
  })),
);

const [zIndex] = useZIndex(
  'FloatButton',
  computed(() => style?.zIndex as number),
);

const floatButtonGroupRef = useTemplateRef('floatButtonGroupRef');

const mergedPlacement = computed(() => (['top', 'left', 'right', 'bottom'].includes(placement!) ? placement : 'top'));

const open = defineModel<boolean>('open', { default: false });

const hoverTrigger = computed(() => trigger === 'hover');
const clickTrigger = computed(() => trigger === 'click');

function triggerOpen(nextOpen: boolean) {
  if (open.value !== nextOpen) {
    open.value = nextOpen;
    onOpenChange?.(nextOpen);
  }
}

function onMouseEnter() {
  if (hoverTrigger.value) {
    triggerOpen(true);
  }
}

function onMouseLeave() {
  if (hoverTrigger.value) {
    triggerOpen(false);
  }
}

const onInternalTriggerButtonClick: FloatButtonGroupProps['onClick'] = (e) => {
  if (clickTrigger.value) {
    triggerOpen(!open.value);
  }
  onTriggerButtonClick?.(e);
};

let onDocClick: (e: MouseEvent) => void;

watch(
  () => clickTrigger.value,
  async (val) => {
    await nextTick();
    if (val) {
      onDocClick = (e: MouseEvent) => {
        // Skip if click on the group
        if (floatButtonGroupRef.value?.contains(e.target as Node)) {
          return;
        }
        triggerOpen(false);
      };
      document.addEventListener('click', onDocClick, { capture: true });
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick, { capture: true });
});

// ======================== Contexts ========================
const individual = computed(() => shape === 'circle');

const listContext = computed(() => ({
  shape,
  individual: individual.value,
  classNames: mergedClassNames?.value?.item,
  styles: mergedStyles?.value?.item,
}));

const triggerContext = computed(() => ({
  ...listContext.value,
  individual: true,
  classNames: mergedClassNames?.value?.trigger,
  styles: mergedStyles?.value?.trigger,
}));

// ========================= Render =========================
const listCls = computed(() => `${groupPrefixCls.value}-list`);
</script>
<template>
  <GroupContextProvider :value="listContext">
    <div
      :class="
        clsx(groupPrefixCls, hashId, cssVarCls, rootCls, contextClassName, mergedClassNames.root, className, rootClassName, {
          [`${groupPrefixCls}-rtl`]: direction === 'rtl',
          [`${groupPrefixCls}-individual`]: individual,
          [`${groupPrefixCls}-${mergedPlacement}`]: isMenuMode,
          [`${groupPrefixCls}-menu-mode`]: isMenuMode,
        })
      "
      :style="{ ...contextStyle, zIndex, ...mergedStyles.root, ...style }"
      ref="floatButtonGroupRef"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
    >
      <template v-if="isMenuMode">
        <CSSMotion :visible="open" :motion-name="`${listCls}-motion`">
          <template #default="{ class: motionClassName, ref: motionRef }">
            <component
              :is="individual ? Flex : Space.Compact"
              :ref="motionRef"
              :vertical="mergedPlacement === 'top' || mergedPlacement === 'bottom'"
              :style="mergedStyles.list"
              :class="clsx(listCls, mergedClassNames.list, motionClassName)"
            >
              <slot></slot>
            </component>
          </template>
        </CSSMotion>
        <GroupContextProvider :value="triggerContext">
          <FloatButton
            :type="type"
            :aria-label="ariaLabel"
            :icon="open ? mergedCloseIcon : icon"
            :class="`${groupPrefixCls}-trigger`"
            @click="onInternalTriggerButtonClick"
            v-bind="floatButtonProps"
          />
        </GroupContextProvider>
      </template>
      <component
        v-else
        :is="individual ? Flex : Space.Compact"
        :vertical="mergedPlacement === 'top' || mergedPlacement === 'bottom'"
        :style="mergedStyles.list"
        :class="clsx(listCls, mergedClassNames.list)"
      >
        <slot></slot>
      </component>
    </div>
  </GroupContextProvider>
</template>
