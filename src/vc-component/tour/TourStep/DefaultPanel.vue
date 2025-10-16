<script lang="tsx" setup>
import { computed } from 'vue';
import type { TourStepProps } from '../interface';
import pickAttrs from '@/vc-util/pickAttrs';
import clsx from 'clsx';
import Render from '@/vc-component/render';

export type DefaultPanelProps = TourStepProps & {
  closable: Exclude<TourStepProps['closable'], boolean>;
};

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  current,
  total,
  title,
  description,
  onClose,
  onPrev,
  onNext,
  onFinish,
  class: className,
  closable,
  classNames: tourClassNames,
  styles,
} = defineProps<DefaultPanelProps>();
const ariaProps = computed(() => pickAttrs(closable || {}, true));
const closeIcon = () => {
  return closable?.closeIcon ?? <span class={`${prefixCls}-close-x`}>&times;</span>;
};
const mergedClosable = computed(() => !!closable);
</script>
<template>
  <div :class="clsx(`${prefixCls}-pannel`, className)">
    <div :class="clsx(`${prefixCls}-section`, tourClassNames?.section)" :style="styles?.section">
      <button
        v-if="mergedClosable"
        type="button"
        @click="onClose"
        aria-label="Close"
        v-bind="ariaProps"
        :class="`${prefixCls}-close`"
      >
        <Render :content="closeIcon" />
      </button>
      <div :class="clsx(`${prefixCls}-header`, tourClassNames?.header)" :style="styles?.header">
        <div :class="clsx(`${prefixCls}-title`, tourClassNames?.title)" :style="styles?.title">
          <Render :content="title" />
        </div>
      </div>
      <div :class="clsx(`${prefixCls}-description`, tourClassNames?.description)" :style="styles?.description">
        <Render :content="description" />
      </div>
      <div :class="clsx(`${prefixCls}-footer`, tourClassNames?.footer)" :style="styles?.footer">
        <div :class="`${prefixCls}-sliders`">
          <template v-if="total > 1">
            <span
              v-for="(item, index) in [...Array.from({ length: total }).keys()]"
              :key="item"
              :class="index === current ? 'active' : ''"
            ></span>
          </template>
        </div>
        <div :class="clsx(`${prefixCls}-actions`, tourClassNames?.actions)" :style="styles?.actions">
          <button v-if="current !== 0" :class="`${prefixCls}-prev-btn`" @click="onPrev">Prev</button>
          <button v-if="current === total - 1" :class="`${prefixCls}-finish-btn`" @click="onFinish">Finish</button>
          <button v-else :class="`${prefixCls}-next-btn`" @click="onNext">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>
