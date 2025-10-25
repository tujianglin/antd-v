<script lang="tsx" setup>
import { computed, defineComponent, nextTick, ref, useTemplateRef, watch, type CSSProperties, type PropType } from 'vue';
import { isValidText } from './util';
import type { VueNode } from '@/vc-util/type';
import { toArray } from '@/vc-util/Children/toArray';
import Render from '@/vc-component/render';

interface MeasureTextRef {
  isExceed: () => boolean;
  getHeight: () => number;
}

export interface EllipsisProps {
  enableMeasure?: boolean;
  text?: VueNode;
  width: number;
  rows: number;
  onEllipsis: (isEllipsis: boolean) => void;
  expanded: boolean;
  /**
   * Mark for misc update. Which will not affect ellipsis content length.
   * e.g. tooltip content update.
   */
  miscDeps: any[];
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { enableMeasure, width, text, rows, expanded, onEllipsis } = defineProps<EllipsisProps>();

const slots = defineSlots<{
  default: (props: {
    cutChildren: VueNode[];
    /** Tell current `text` is exceed the `rows` which can be ellipsis */
    canEllipsis: boolean;
  }) => VueNode[];
}>();

const children = computed(() => slots.default);

const MeasureText = defineComponent({
  props: {
    style: {
      type: Object as PropType<CSSProperties>,
      default: () => ({}),
    },
  },
  setup(props, { slots, expose }) {
    const spanRef = ref<HTMLSpanElement>(null);

    expose({
      get el() {
        return spanRef.value || {};
      },
      isExceed: () => {
        const span = spanRef.value!;
        return span.scrollHeight > span.clientHeight;
      },
      getHeight: () => spanRef.value!.clientHeight,
    });

    return () => (
      <span
        aria-hidden
        ref={spanRef}
        style={{
          position: 'fixed',
          display: 'block',
          left: 0,
          top: 0,
          pointerEvents: 'none',
          backgroundColor: 'rgba(255, 0, 0, 0.65)',
          ...props.style,
        }}
      >
        {slots?.default?.()}
      </span>
    );
  },
});

const getNodesLen = (nodeList) => {
  return [nodeList[0]?.children].reduce((totalLen, node) => totalLen + (isValidText(node) ? String(node).length : 1), 0);
};
function sliceNodes(nodeList, len: number) {
  let currLen = 0;
  const currentNodeList = [];
  nodeList = nodeList[0]?.children || [];

  for (let i = 0; i < nodeList.length; i += 1) {
    // Match to return
    if (currLen === len) {
      return currentNodeList;
    }

    const node = nodeList[i];
    const canCut = isValidText(node);
    const nodeLen = canCut ? String(node).length : 1;
    const nextLen = currLen + nodeLen;

    // Exceed but current not which means we need cut this
    // This will not happen on validate ReactElement
    if (nextLen > len) {
      const restLen = len - currLen;
      currentNodeList.push(String(node).slice(0, restLen));
      return currentNodeList;
    }

    currentNodeList.push(node);
    currLen = nextLen;
  }
  return nodeList;
}

// Measure for the `text` is exceed the `rows` or not
const STATUS_MEASURE_NONE = 0;
const STATUS_MEASURE_PREPARE = 1;
const STATUS_MEASURE_START = 2;
const STATUS_MEASURE_NEED_ELLIPSIS = 3;
const STATUS_MEASURE_NO_NEED_ELLIPSIS = 4;

const lineClipStyle: CSSProperties = {
  display: '-webkit-box',
  overflow: 'hidden',
  WebkitBoxOrient: 'vertical',
};

const nodeList = computed(() => toArray(text));
const nodeLen = computed(() => getNodesLen(nodeList.value));

// ========================= Full Content =========================
// Used for measure only, which means it's always render as no need ellipsis
const fullContent = computed(() => children.value({ cutChildren: nodeList.value, canEllipsis: false }));

// ========================= Cut Content ==========================
const ellipsisCutIndex = ref<[number, number] | null>(null);
const cutMidRef = useTemplateRef<MeasureTextRef>('cutMidRef');

// ========================= NeedEllipsis =========================
const measureWhiteSpaceRef = useTemplateRef('measureWhiteSpaceRef');
const needEllipsisRef = useTemplateRef<MeasureTextRef>('needEllipsisRef');
// Measure for `rows-1` height, to avoid operation exceed the line height
const descRowsEllipsisRef = useTemplateRef<MeasureTextRef>('descRowsEllipsisRef');
const symbolRowEllipsisRef = useTemplateRef<MeasureTextRef>('symbolRowEllipsisRef');

const canEllipsis = ref(false);
const needEllipsis = ref(STATUS_MEASURE_NONE);
const ellipsisHeight = ref(0);
const parentWhiteSpace = ref<CSSProperties['whiteSpace'] | null>(null);

// Trigger start measure
watch(
  () => [width, text, rows, enableMeasure, nodeList.value],
  () => {
    if (enableMeasure && width && nodeLen.value) {
      needEllipsis.value = STATUS_MEASURE_PREPARE;
    } else {
      needEllipsis.value = STATUS_MEASURE_NONE;
    }
  },
  { flush: 'post', immediate: true, deep: true },
);

// Measure process
watch(
  needEllipsis,
  async () => {
    await nextTick();
    if (needEllipsis.value === STATUS_MEASURE_PREPARE) {
      needEllipsis.value = STATUS_MEASURE_START;

      // Parent ref `white-space`
      const nextWhiteSpace = measureWhiteSpaceRef.value && getComputedStyle(measureWhiteSpaceRef.value).whiteSpace;
      parentWhiteSpace.value = nextWhiteSpace;
    } else if (needEllipsis.value === STATUS_MEASURE_START) {
      const isOverflow = !!needEllipsisRef.value?.isExceed();

      needEllipsis.value = isOverflow ? STATUS_MEASURE_NEED_ELLIPSIS : STATUS_MEASURE_NO_NEED_ELLIPSIS;
      ellipsisCutIndex.value = isOverflow ? [0, nodeLen.value] : null;
      canEllipsis.value = isOverflow;

      // Get the basic height of ellipsis rows
      const baseRowsEllipsisHeight = needEllipsisRef.value?.getHeight() || 0;

      // Get the height of `rows - 1` + symbol height
      const descRowsEllipsisHeight = rows === 1 ? 0 : descRowsEllipsisRef.value?.getHeight() || 0;
      const symbolRowEllipsisHeight = symbolRowEllipsisRef.value?.getHeight() || 0;
      const maxRowsHeight = Math.max(
        baseRowsEllipsisHeight,
        // height of rows with ellipsis
        descRowsEllipsisHeight + symbolRowEllipsisHeight,
      );

      ellipsisHeight.value = maxRowsHeight + 1;
      onEllipsis(isOverflow);
    }
  },
  { immediate: true, deep: true },
);

// ========================= Cut Measure ==========================
const cutMidIndex = computed(() =>
  ellipsisCutIndex.value ? Math.ceil((ellipsisCutIndex.value[0] + ellipsisCutIndex.value[1]) / 2) : 0,
);

watch(
  [ellipsisCutIndex, cutMidIndex],
  () => {
    const [minIndex, maxIndex] = ellipsisCutIndex.value || [0, 0];
    if (minIndex !== maxIndex) {
      const midHeight = cutMidRef.value?.getHeight() || 0;

      const isOverflow = midHeight > ellipsisHeight.value;
      let targetMidIndex = cutMidIndex.value;
      if (maxIndex - minIndex === 1) {
        targetMidIndex = isOverflow ? minIndex : maxIndex;
      }
      ellipsisCutIndex.value = isOverflow ? [minIndex, targetMidIndex] : [targetMidIndex, maxIndex];
    }
  },
  { flush: 'post', immediate: true },
);

// ========================= Text Content =========================
const FinalContent = () => {
  // Skip everything if `enableMeasure` is disabled
  if (!enableMeasure) {
    return children.value({ cutChildren: nodeList.value, canEllipsis: false });
  }

  if (
    needEllipsis.value !== STATUS_MEASURE_NEED_ELLIPSIS ||
    !ellipsisCutIndex.value ||
    ellipsisCutIndex.value[0] !== ellipsisCutIndex.value[1]
  ) {
    const content = children.value({ cutChildren: nodeList.value, canEllipsis: false });
    // Limit the max line count to avoid scrollbar blink unless no need ellipsis
    // https://github.com/ant-design/ant-design/issues/42958
    if ([STATUS_MEASURE_NO_NEED_ELLIPSIS, STATUS_MEASURE_NONE].includes(needEllipsis.value)) {
      return content;
    }
    return (
      <span
        style={{
          ...lineClipStyle,
          WebkitLineClamp: rows,
        }}
      >
        {content}
      </span>
    );
  }

  return children.value({
    cutChildren: expanded ? nodeList.value : sliceNodes(nodeList.value, ellipsisCutIndex.value[0]),
    canEllipsis: canEllipsis.value,
  });
};

// ============================ Render ============================
const measureStyle = computed<CSSProperties>(() => ({
  width: `${width}px`,
  margin: 0,
  padding: 0,
  whiteSpace: parentWhiteSpace.value === 'nowrap' ? 'normal' : 'inherit',
}));
</script>
<template>
  <FinalContent />
  <template v-if="needEllipsis === STATUS_MEASURE_START">
    <MeasureText :style="{ ...measureStyle, ...lineClipStyle, WebkitLineClamp: rows }" ref="needEllipsisRef">
      <Render :content="fullContent" />
    </MeasureText>
    <MeasureText :style="{ ...measureStyle, ...lineClipStyle, WebkitLineClamp: rows - 1 }" ref="descRowsEllipsisRef">
      <Render :content="fullContent" />
    </MeasureText>
    <MeasureText :style="{ ...measureStyle, ...lineClipStyle, WebkitLineClamp: 1 }" ref="symbolRowEllipsisRef">
      <Render :content="children({ cutChildren: [], canEllipsis: true })" />
    </MeasureText>
  </template>
  <MeasureText
    v-if="needEllipsis === STATUS_MEASURE_NEED_ELLIPSIS && ellipsisCutIndex && ellipsisCutIndex[0] !== ellipsisCutIndex[1]"
    :style="{ ...measureStyle, top: `${400}px` }"
    ref="cutMidRef"
  >
    <Render :content="children({ cutChildren: sliceNodes(nodeList, cutMidIndex), canEllipsis: true })" />
  </MeasureText>
  <span v-if="needEllipsis === STATUS_MEASURE_PREPARE" :style="{ whiteSpace: 'inherit' }" ref="measureWhiteSpaceRef"></span>
</template>
