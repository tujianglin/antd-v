<script lang="tsx" setup>
import Render from '@/vc-component/render';
import clsx from 'clsx';
import { computed, onBeforeUnmount, toRefs, watch } from 'vue';
import { devUseWarning } from '../_util/warning';
import { useConfigContextInject } from '../config-provider';
import { useAnchorContextInject } from './context';

export interface AnchorLinkBaseProps {
  prefixCls?: string;
  href: string;
  target?: string;
  title: any;
  class?: string;
  replace?: boolean;
}

export interface AnchorLinkProps extends AnchorLinkBaseProps {
  children?: any;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  href,
  title,
  prefixCls: customizePrefixCls,
  children,
  class: className,
  target,
  replace,
} = defineProps<AnchorLinkProps>();

const {
  registerLink,
  unregisterLink,
  scrollTo,
  onClick,
  activeLink,
  direction,
  classNames: mergedClassNames,
  styles: mergedStyles,
} = toRefs(useAnchorContextInject());

watch(
  () => href,
  () => {
    registerLink?.value?.(href);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  unregisterLink?.value?.(href);
});

const handleClick = (e: MouseEvent) => {
  onClick?.value?.(e, { title, href });
  scrollTo?.value?.(href);

  // Support clicking on an anchor does not record history.
  if (e.defaultPrevented) {
    return;
  }

  const isExternalLink = href.startsWith('http://') || href.startsWith('https://');
  // Support external link
  if (isExternalLink) {
    if (replace) {
      e.preventDefault();
      window.location.replace(href);
    }
    return;
  }

  // Handling internal anchor link
  e.preventDefault();
  const historyMethod = replace ? 'replaceState' : 'pushState';
  window.history[historyMethod](null, '', href);
};

// =================== Warning =====================
if (process.env.NODE_ENV !== 'production') {
  const warning = devUseWarning('Anchor.Link');

  warning(
    direction?.value !== 'horizontal',
    'usage',
    '`Anchor.Link children` is not supported when `Anchor` direction is horizontal',
  );
}

const { getPrefixCls } = toRefs(useConfigContextInject());

const prefixCls = getPrefixCls.value('anchor', customizePrefixCls);

const active = computed(() => activeLink.value === href);

const wrapperClassName = computed(() =>
  clsx(`${prefixCls}-link`, className, mergedClassNames?.value?.item, {
    [`${prefixCls}-link-active`]: active.value,
  }),
);

const titleClassName = computed(() =>
  clsx(`${prefixCls}-link-title`, mergedClassNames?.value?.title, {
    [`${prefixCls}-link-title-active`]: active.value,
  }),
);
</script>
<template>
  <div :class="wrapperClassName" :style="mergedStyles?.item">
    <a
      :class="titleClassName"
      :style="mergedStyles?.title"
      :href="href"
      :title="typeof title === 'string' ? title : ''"
      :target="target"
      @click="handleClick"
    >
      <Render :content="title" />
    </a>
    <Render v-if="direction !== 'horizontal'" :content="children" />
  </div>
</template>
