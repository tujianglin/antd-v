<script lang="tsx" setup>
import { computed, nextTick, onBeforeUnmount, useTemplateRef, watch } from 'vue';
import { floatButtonPrefixCls, type FloatButtonGroupProps } from './interface';
import { useComponentConfig } from '../config-provider/context';
import { CloseOutlined, FileTextOutlined } from '@ant-design/icons-vue';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useStyle from './style';
import useMergeSemantic from '../_util/hooks/useMergeSemantic';
import { useZIndex } from '../_util/hooks/useZIndex';
import GroupContextProvider from './GroupContextProvider.vue';
import { cn } from '@/utils/cn';
import FloatButton from './FloatButton.vue';
import Flex from '../flex';
import Space from '../space';

defineOptions({ name: 'FloatButtonGroup' });

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

const config = useComponentConfig('floatButtonGroup');

const mergedCloseIcon = computed(() => closeIcon ?? config.closeIcon ?? <CloseOutlined />);

const prefixCls = config.getPrefixCls(floatButtonPrefixCls, customizePrefixCls);
const rootCls = useCSSVarCls(prefixCls);

const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

const groupPrefixCls = `${prefixCls}-group`;

const isMenuMode = computed(() => trigger && ['click', 'hover'].includes(trigger));

const merged = useMergeSemantic(
  computed(() => [config.classNames, classNames]),
  computed(() => [config.styles, styles]),
  computed(() => ({
    item: {
      _default: 'root',
    },
    trigger: {
      _default: 'root',
    },
  })),
);

const [zIndex] = useZIndex('FloatButton', style?.zIndex as number);

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
  classNames: merged.mergedClassNames?.item,
  styles: merged.mergedStyles?.item,
}));

const triggerContext = computed(() => ({
  ...listContext.value,
  individual: true,
  classNames: merged.mergedClassNames?.trigger,
  styles: merged.mergedStyles?.trigger,
}));

// ========================= Render =========================
const listCls = `${groupPrefixCls}-list`;
</script>
<template>
  <GroupContextProvider :value="listContext">
    <div
      :class="
        cn(groupPrefixCls, hashId, cssVarCls, rootCls, config.class, merged.mergedClassNames.root, className, rootClassName, {
          [`${groupPrefixCls}-rtl`]: config.direction === 'rtl',
          [`${groupPrefixCls}-individual`]: individual,
          [`${groupPrefixCls}-${mergedPlacement}`]: isMenuMode,
          [`${groupPrefixCls}-menu-mode`]: isMenuMode,
        })
      "
      :style="{ ...config.style, zIndex, ...merged.mergedStyles.root, ...style }"
      ref="floatButtonGroupRef"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
    >
      <template v-if="isMenuMode">
        <Transition :name="`${listCls}-motion`">
          <component
            v-show="open"
            :is="individual ? Flex : Space.Compact"
            :vertical="mergedPlacement === 'top' || mergedPlacement === 'bottom'"
            :style="merged.mergedStyles.list"
            :class="cn(listCls, merged.mergedClassNames.list)"
          >
            <slot></slot>
          </component>
        </Transition>
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
        :style="merged.mergedStyles.list"
        :class="cn(listCls, merged.mergedClassNames.list)"
      >
        <slot></slot>
      </component>
    </div>
  </GroupContextProvider>
</template>
