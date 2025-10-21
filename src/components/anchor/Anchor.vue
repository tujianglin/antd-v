<script lang="tsx" setup>
import type { VueKey } from '@/vc-util/type';
import clsx from 'clsx';
import scrollIntoView from 'scroll-into-view-if-needed';
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, ref, toRefs, watch, type CSSProperties } from 'vue';
import { Affix } from '..';
import getScroll from '../_util/getScroll';
import scrollTo from '../_util/scrollTo';
import type { AffixProps } from '../affix/index.vue';
import { useComponentConfig, useConfigContextInject } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import type { AnchorLinkBaseProps } from './AnchorLink.vue';
import { AnchorContextProvider } from './context';
import useStyle from './style';
import AnchorLink from './AnchorLink.vue';
import useMergeSemantic from '../_util/hooks/useMergeSemantic';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks/useMergeSemantic';

export interface AnchorLinkItemProps extends AnchorLinkBaseProps {
  key: VueKey;
  children?: AnchorLinkItemProps[];
}

export type AnchorContainer = HTMLElement | Window;

interface Section {
  link: string;
  top: number;
}

type SemanticName = 'root' | 'item' | 'title' | 'indicator';
export type AnchorClassNamesType = SemanticClassNamesType<AnchorProps, SemanticName>;
export type AnchorStylesType = SemanticStylesType<AnchorProps, SemanticName>;
export interface AnchorProps {
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
  style?: CSSProperties;
  classNames?: AnchorClassNamesType;
  styles?: AnchorStylesType;
  offsetTop?: number;
  bounds?: number;
  affix?: boolean | Omit<AffixProps, 'offsetTop' | 'target' | 'children'>;
  showInkInFixed?: boolean;
  getContainer?: () => AnchorContainer;
  /** Return customize highlight anchor */
  getCurrentAnchor?: (activeLink: string) => string;
  onClick?: (e: MouseEvent, link: { title: any; href: string }) => void;
  /** Scroll to target offset value, if none, it's offsetTop prop value or 0. */
  targetOffset?: number;
  /** Listening event when scrolling change active link */
  onChange?: (currentActiveLink: string) => void;
  items?: AnchorLinkItemProps[];
  direction?: AnchorDirection;
  replace?: boolean;
}

export interface AnchorState {
  activeLink: null | string;
}

export interface AnchorDefaultProps extends AnchorProps {
  prefixCls: string;
  affix: boolean;
  showInkInFixed: boolean;
  getContainer: () => AnchorContainer;
}

export type AnchorDirection = 'vertical' | 'horizontal';

export interface AntAnchor {
  registerLink: (link: string) => void;
  unregisterLink: (link: string) => void;
  activeLink: string | null;
  scrollTo: (link: string) => void;
  onClick?: (e: MouseEvent, link: { title: any; href: string }) => void;
  direction: AnchorDirection;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
}

defineOptions({ name: 'Anchor', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  rootClassName,
  prefixCls: customPrefixCls,
  class: className,
  style,
  offsetTop,
  affix = true,
  showInkInFixed = false,
  items,
  direction: anchorDirection = 'vertical',
  bounds,
  targetOffset,
  onClick,
  onChange,
  getContainer,
  getCurrentAnchor,
  replace,
  classNames: anchorClassNames,
  styles,
} = defineProps<AnchorProps>();

function getDefaultContainer() {
  return window;
}

function getOffsetTop(element: HTMLElement, container: AnchorContainer): number {
  if (!element.getClientRects().length) {
    return 0;
  }

  const rect = element.getBoundingClientRect();

  if (rect.width || rect.height) {
    if (container === window) {
      return rect.top - element.ownerDocument!.documentElement!.clientTop;
    }
    return rect.top - (container as HTMLElement).getBoundingClientRect().top;
  }

  return rect.top;
}

const sharpMatcherRegex = /#([\S ]+)$/;

const links = ref<string[]>([]);
const activeLink = ref<string | null>(null);
const activeLinkRef = ref<string | null>(activeLink.value);

const wrapperRef = ref<HTMLDivElement>(null);
const spanLinkNode = ref<HTMLSpanElement>(null);
const animating = ref<boolean>(false);

// eslint-disable-next-line vue/no-dupe-keys
const {
  direction,
  getPrefixCls,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('anchor'));

const { getTargetContainer } = toRefs(useConfigContextInject());

const prefixCls = computed(() => getPrefixCls.value('anchor', customPrefixCls));

const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

const getCurrentContainer = computed(() => getContainer ?? getTargetContainer?.value ?? getDefaultContainer);

const dependencyListItem = computed(() => JSON.stringify(links?.value));

const registerLink: AntAnchor['registerLink'] = (link) => {
  if (!links.value.includes(link)) {
    links.value = [...links.value, link];
  }
};

const unregisterLink: AntAnchor['unregisterLink'] = (link) => {
  if (links.value.includes(link)) {
    links.value = links.value.filter((i) => i !== link);
  }
};

const updateInk = () => {
  const linkNode = wrapperRef.value?.querySelector<HTMLElement>(`.${prefixCls.value}-link-title-active`);
  if (linkNode && spanLinkNode.value) {
    const { style: inkStyle } = spanLinkNode.value;
    const horizontalAnchor = anchorDirection === 'horizontal';
    inkStyle.top = horizontalAnchor ? '' : `${linkNode.offsetTop + linkNode.clientHeight / 2}px`;
    inkStyle.height = horizontalAnchor ? '' : `${linkNode.clientHeight}px`;
    inkStyle.left = horizontalAnchor ? `${linkNode.offsetLeft}px` : '';
    inkStyle.width = horizontalAnchor ? `${linkNode.clientWidth}px` : '';
    if (horizontalAnchor) {
      scrollIntoView(linkNode, { scrollMode: 'if-needed', block: 'nearest' });
    }
  }
};

const getInternalCurrentAnchor = (_links: string[], _offsetTop = 0, _bounds = 5): string => {
  const linkSections: Section[] = [];
  const container = getCurrentContainer?.value?.();
  _links.forEach((link) => {
    const sharpLinkMatch = sharpMatcherRegex.exec(link?.toString());
    if (!sharpLinkMatch) {
      return;
    }
    const target = document.getElementById(sharpLinkMatch[1]);
    if (target) {
      const top = getOffsetTop(target, container);
      if (top <= _offsetTop + _bounds) {
        linkSections.push({ link, top });
      }
    }
  });
  if (linkSections.length) {
    const maxSection = linkSections.reduce((prev, curr) => (curr.top > prev.top ? curr : prev));
    return maxSection.link;
  }
  return '';
};

const setCurrentActiveLink = (link: string) => {
  // FIXME: Seems a bug since this compare is not equals
  // `activeLinkRef` is parsed value which will always trigger `onChange` event.
  if (activeLinkRef.value === link) {
    return;
  }

  // https://github.com/ant-design/ant-design/issues/30584
  const newLink = typeof getCurrentAnchor === 'function' ? getCurrentAnchor(link) : link;
  activeLink.value = newLink;
  activeLinkRef.value = newLink;

  // onChange should respect the original link (which may caused by
  // window scroll or user click), not the new link
  onChange?.(link);
};

const handleScroll = () => {
  if (animating.value) {
    return;
  }

  const currentActiveLink = getInternalCurrentAnchor(
    links.value,
    targetOffset !== undefined ? targetOffset : offsetTop || 0,
    bounds,
  );

  setCurrentActiveLink(currentActiveLink);
};

const handleScrollTo = (link) => {
  setCurrentActiveLink(link);
  const sharpLinkMatch = sharpMatcherRegex.exec(link);
  if (!sharpLinkMatch) {
    return;
  }
  const targetElement = document.getElementById(sharpLinkMatch[1]);
  if (!targetElement) {
    return;
  }

  const container = getCurrentContainer?.value?.();
  const scrollTop = getScroll(container);
  const eleOffsetTop = getOffsetTop(targetElement, container);
  let y = scrollTop + eleOffsetTop;
  y -= targetOffset !== undefined ? targetOffset : offsetTop || 0;
  animating.value = true;
  scrollTo(y, {
    getContainer: getCurrentContainer.value,
    callback() {
      animating.value = false;
    },
  });
};

// =========== Merged Props for Semantic ==========
const vm = getCurrentInstance();
const mergedProps = computed<AnchorProps>(() => {
  return {
    ...vm.props,
    direction: anchorDirection,
  };
});

const [mergedClassNames, mergedStyles] = useMergeSemantic<AnchorClassNamesType, AnchorStylesType, AnchorProps>(
  computed(() => [contextClassNames?.value, anchorClassNames]),
  computed(() => [contextStyles?.value, styles]),
  undefined,
  computed(() => ({
    props: mergedProps.value,
  })),
);

const wrapperClass = computed(() => {
  return clsx(
    hashId.value,
    cssVarCls.value,
    rootCls.value,
    rootClassName,
    `${prefixCls.value}-wrapper`,
    {
      [`${prefixCls.value}-wrapper-horizontal`]: anchorDirection === 'horizontal',
      [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
    },
    className,
    contextClassName?.value,
    mergedClassNames?.value?.root,
  );
});

const anchorClass = computed(() =>
  clsx(prefixCls.value, {
    [`${prefixCls.value}-fixed`]: !affix && !showInkInFixed,
  }),
);

const inkClass = computed(() =>
  clsx(`${prefixCls.value}-ink`, mergedClassNames?.value?.indicator, {
    [`${prefixCls.value}-ink-visible`]: activeLink?.value,
  }),
);

const wrapperStyle = computed(
  () =>
    ({
      maxHeight: offsetTop ? `calc(100vh - ${offsetTop}px)` : '100vh',
      ...mergedStyles?.value?.root,
      ...contextStyle?.value,
      ...style,
    }) as CSSProperties,
);

watch(
  dependencyListItem,
  () => {
    const scrollContainer = getCurrentContainer?.value?.();
    handleScroll();
    scrollContainer?.addEventListener('scroll', handleScroll);
  },
  { immediate: true, deep: true },
);

onBeforeUnmount(() => {
  const scrollContainer = getCurrentContainer?.value?.();
  scrollContainer?.removeEventListener('scroll', handleScroll);
});

watch(
  () => getCurrentAnchor,
  () => {
    if (typeof getCurrentAnchor === 'function') {
      setCurrentActiveLink(getCurrentAnchor(activeLinkRef.value || ''));
    }
  },
  { immediate: true, deep: true },
);

watch(
  [() => anchorDirection, () => getCurrentAnchor, dependencyListItem, activeLink],
  async () => {
    await nextTick();
    updateInk();
  },
  { immediate: true, deep: true },
);

const memoizedContextValue = computed<AntAnchor>(() => ({
  registerLink,
  unregisterLink,
  scrollTo: handleScrollTo,
  activeLink: activeLink.value,
  onClick,
  direction: anchorDirection,
  classNames: mergedClassNames.value,
  styles: mergedStyles.value,
}));

const affixProps = computed(() => (affix && typeof affix === 'object' ? affix : undefined));

const createNestedLink = (options?: AnchorLinkItemProps[]) =>
  Array.isArray(options)
    ? options.map((item) => (
        <AnchorLink replace={replace} {...item} key={item.key}>
          {anchorDirection === 'vertical' && createNestedLink(item.children)}
        </AnchorLink>
      ))
    : null;
const AnchorContent = () => {
  return (
    <div ref={wrapperRef} class={wrapperClass.value} style={wrapperStyle.value}>
      <div class={anchorClass.value}>
        <span class={inkClass.value} ref={spanLinkNode} style={mergedStyles?.value?.indicator} />
        {createNestedLink(items)}
      </div>
    </div>
  );
};
</script>
<template>
  <AnchorContextProvider :value="memoizedContextValue">
    <Affix v-if="affix" :offset-top="offsetTop" :target="getCurrentContainer" v-bind="affixProps">
      <AnchorContent />
    </Affix>
    <AnchorContent v-else />
  </AnchorContextProvider>
</template>
