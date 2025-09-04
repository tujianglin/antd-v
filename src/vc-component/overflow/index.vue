<script lang="tsx" setup generic="ItemType extends any">
import { Render } from '../../components';
import ResizeObserver from '../resize-observer';
import clsx from 'clsx';
import { computed, nextTick, ref, resolveDynamicComponent, useAttrs, watch, type CSSProperties } from 'vue';
import { OverflowContextProvider } from './context';
import { INVALIDATE, RESPONSIVE, type OverflowProps } from './interface';
import Item from './Item.vue';
import { falseToUndefined } from '../../vc-util/props';
import type { VueKey } from '@/vc-util/type';

defineOptions({ name: 'Overflow', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls = 'rc-overflow',
  data = [],
  renderItem,
  renderRawItem,
  itemKey,
  itemWidth = 10,
  ssr,
  style,
  class: className,
  maxCount,
  renderRest,
  renderRawRest,
  suffix,
  component: Component = 'div',
  itemComponent,
  onVisibleChange,
  ...restProps
} = defineProps<OverflowProps<ItemType>>();

const fullySSR = computed(() => ssr === 'full');

const containerWidth = ref(null);
const mergedContainerWidth = computed(() => containerWidth.value || 0);

const itemWidths = ref(new Map<VueKey, number>());

const prevRestWidth = ref<number>(0);
const restWidth = ref<number>(0);

const suffixWidth = ref<number>(0);
const suffixFixedStart = ref<number>(null);

const displayCount = ref<number>(null);
const mergedDisplayCount = computed(() => {
  if (displayCount.value === null && fullySSR.value) {
    return Number.MAX_SAFE_INTEGER;
  }
  return displayCount.value || 0;
});

const restReady = ref(false);

const itemPrefixCls = `${prefixCls}-item`;

// Always use the max width to avoid blink
const mergedRestWidth = computed(() => Math.max(prevRestWidth.value, restWidth.value));

// ================================= Data =================================
const isResponsive = computed(() => maxCount === RESPONSIVE);
const shouldResponsive = computed(() => data.length && isResponsive.value);
const invalidate = computed(() => maxCount === INVALIDATE);

/**
 * When is `responsive`, we will always render rest node to get the real width of it for calculation
 */
const showRest = computed(() => shouldResponsive.value || (typeof maxCount === 'number' && data.length > maxCount));

const mergedData = computed(() => {
  let items = data;
  if (shouldResponsive.value) {
    if (containerWidth.value === null && fullySSR.value) {
      items = data;
    } else {
      items = data.slice(0, Math.min(data.length, mergedContainerWidth.value / itemWidth));
    }
  } else if (typeof maxCount === 'number') {
    items = data.slice(0, maxCount);
  }
  return items;
});

const omittedItems = computed(() => {
  if (shouldResponsive.value) {
    return data.slice(mergedDisplayCount.value + 1);
  }
  return data.slice(mergedData.value.length);
});

// ================================= mItem =================================
const getKey = (item: ItemType, index: number) => {
  if (typeof itemKey === 'function') {
    return itemKey(item);
  }
  return (itemKey && (item as any)?.[itemKey]) ?? index;
};

const mergedRenderItem = renderItem || ((item: ItemType) => item);

function updateDisplayCount(count: number, suffixFixedStartVal: number, notReady?: boolean) {
  // React 18 will sync render even when the value is same in some case.
  // We take `mergedData` as deps which may cause dead loop if it's dynamic generate.
  // ref: https://github.com/ant-design/ant-design/issues/36559
  if (displayCount.value === count && (suffixFixedStartVal === undefined || suffixFixedStartVal === suffixFixedStart.value)) {
    return;
  }
  displayCount.value = count;
  if (!notReady) {
    restReady.value = count < data.length - 1;

    onVisibleChange?.(count);
  }

  if (suffixFixedStartVal !== undefined) {
    suffixFixedStart.value = suffixFixedStartVal;
  }
}

// ================================= Size =================================
function onOverflowResize(_: object, element: HTMLElement) {
  containerWidth.value = element.clientWidth;
}

function registerSize(key: VueKey, width: number | null) {
  const clone = new Map(itemWidths.value);

  if (width === null) {
    clone.delete(key);
  } else {
    clone.set(key, width);
  }
  itemWidths.value = clone;
}

function registerOverflowSize(_: VueKey, width: number | null) {
  restWidth.value = width!;
  prevRestWidth.value = restWidth.value;
}

function registerSuffixSize(_: VueKey, width: number | null) {
  suffixWidth.value = width!;
}

// ================================ Effect ================================
function getItemWidth(index: number) {
  return itemWidths.value.get(getKey(mergedData[index], index));
}

watch(
  [
    () => mergedContainerWidth.value,
    () => itemWidths.value,
    () => restWidth.value,
    () => suffixWidth.value,
    () => getKey,
    () => mergedData.value,
  ],
  async () => {
    await nextTick();
    if (mergedContainerWidth.value && typeof mergedRestWidth.value === 'number' && mergedData.value) {
      let totalWidth = suffixWidth.value;

      const len = mergedData.value.length;
      const lastIndex = len - 1;

      // When data count change to 0, reset this since not loop will reach
      if (!len) {
        updateDisplayCount(0, null);
        return;
      }

      for (let i = 0; i < len; i += 1) {
        let currentItemWidth = getItemWidth(i);

        // Fully will always render
        if (fullySSR.value) {
          currentItemWidth = currentItemWidth || 0;
        }

        // Break since data not ready
        if (currentItemWidth === undefined) {
          updateDisplayCount(i - 1, undefined, true);
          break;
        }

        // Find best match
        totalWidth += currentItemWidth;

        if (
          // Only one means `totalWidth` is the final width
          (lastIndex === 0 && totalWidth <= mergedContainerWidth.value) ||
          // Last two width will be the final width
          (i === lastIndex - 1 && totalWidth + getItemWidth(lastIndex)! <= mergedContainerWidth.value)
        ) {
          // Additional check if match the end
          updateDisplayCount(lastIndex, null);
          break;
        } else if (totalWidth + mergedRestWidth.value > mergedContainerWidth.value) {
          // Can not hold all the content to show rest
          updateDisplayCount(i - 1, totalWidth - currentItemWidth - suffixWidth.value + restWidth.value);
          break;
        }
      }

      if (suffix && getItemWidth(0) + suffixWidth.value > mergedContainerWidth.value) {
        suffixFixedStart.value = null;
      }
    }
  },
  { flush: 'post', immediate: true },
);

// ================================ Render ================================
const displayRest = computed(() => restReady.value && !!omittedItems.value.length);

const suffixStyle = computed((): CSSProperties => {
  if (suffixFixedStart.value !== null && shouldResponsive.value) {
    return {
      position: 'absolute',
      left: `${suffixFixedStart.value}px`,
      top: 0,
    };
  }
  return {};
});

const itemSharedProps = computed(() => ({
  prefixCls: itemPrefixCls,
  responsive: shouldResponsive.value,
  component: itemComponent,
  invalidate: invalidate.value,
}));

// >>>>> Choice render fun by `renderRawItem`
const internalRenderItemNode = () => {
  return renderRawItem
    ? (item: ItemType, index: number) => {
        const key = getKey(item, index);

        return (
          <OverflowContextProvider
            key={key}
            value={{
              ...itemSharedProps.value,
              order: index,
              item,
              itemKey: key,
              registerSize,
              display: index <= mergedDisplayCount.value,
            }}
          >
            {renderRawItem(item, index)}
          </OverflowContextProvider>
        );
      }
    : (item: ItemType, index: number) => {
        const key = getKey(item, index);

        return (
          <Item
            {...itemSharedProps.value}
            order={index}
            key={key}
            item={item}
            renderItem={mergedRenderItem}
            itemKey={key}
            registerSize={registerSize}
            display={index <= mergedDisplayCount.value}
          />
        );
      };
};

// >>>>> Rest node
const restContextProps = computed(() => ({
  order: displayRest.value ? mergedDisplayCount.value : Number.MAX_SAFE_INTEGER,
  class: `${itemPrefixCls}-rest`,
  registerSize: registerOverflowSize,
  display: displayRest.value,
}));

function defaultRenderRest<ItemType>(omittedItems: ItemType[]) {
  return `+ ${omittedItems.length} ...`;
}

const mergedRenderRest = computed((): any => renderRest || defaultRenderRest);
const restNode = () => {
  return renderRawRest ? (
    <OverflowContextProvider
      value={{
        ...itemSharedProps.value,
        ...restContextProps.value,
      }}
    >
      {renderRawRest(omittedItems.value)}
    </OverflowContextProvider>
  ) : (
    <Item
      {...itemSharedProps.value}
      // When not show, order should be the last
      {...restContextProps.value}
    >
      {typeof mergedRenderRest.value === 'function' ? mergedRenderRest.value(omittedItems.value) : mergedRenderRest.value}
    </Item>
  );
};

const domRef = ref();

defineExpose({
  get el() {
    return domRef.value || {};
  },
});

const attrs = useAttrs();
const OverflowNode = () => {
  const Dynamic = resolveDynamicComponent(Component) as any;
  return (
    <Dynamic
      class={clsx(!invalidate.value && prefixCls, className)}
      style={style}
      ref={domRef}
      {...restProps}
      {...falseToUndefined(attrs)}
    >
      {mergedData.value.map(internalRenderItemNode())}

      {/* Rest Count Item */}
      {showRest.value ? <Render content={restNode}></Render> : null}

      {/* Suffix Node */}
      {suffix && (
        <Item
          {...itemSharedProps.value}
          responsive={isResponsive.value}
          responsiveDisabled={!shouldResponsive.value}
          order={mergedDisplayCount.value}
          class={`${itemPrefixCls}-suffix`}
          registerSize={registerSuffixSize}
          display
          style={suffixStyle.value}
        >
          <Render content={suffix}></Render>
        </Item>
      )}
    </Dynamic>
  );
};
</script>
<template>
  <ResizeObserver v-if="isResponsive" @resize="onOverflowResize" :disabled="!shouldResponsive">
    <OverflowNode />
  </ResizeObserver>
  <OverflowNode v-else />
</template>
