<script lang="tsx" setup>
import { computed, ref, toRefs, type CSSProperties } from 'vue';
import type { ButtonProps } from '../button';
import Button from '../button';
import { useLocale } from '../locale';
import defaultLocale from '../locale/en_US';
import type { SemanticName, TourStepProps } from './interface';
import { reactiveComputed } from '@vueuse/core';
import pickAttrs from '@/vc-util/pickAttrs';
import { CloseOutlined } from '@ant-design/icons-vue';
import { isValidNode } from '@/vc-util/Children/util';
import clsx from 'clsx';
import Render from '@/vc-component/render';

interface TourPanelProps {
  stepProps: Omit<TourStepProps, 'closable'> & {
    closable?: Exclude<TourStepProps['closable'], boolean>;
  };
  current: number;
  type: TourStepProps['type'];
  indicatorsRender?: TourStepProps['indicatorsRender'];
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  actionsRender?: TourStepProps['actionsRender'];
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

// Due to the independent design of Panel, it will be too coupled to put in rc-tour,
// so a set of Panel logic is implemented separately in antd.
const { stepProps, current, type, indicatorsRender, actionsRender } = defineProps<TourPanelProps>();
const {
  prefixCls,
  total = ref(1),
  title,
  onClose,
  onPrev,
  onNext,
  onFinish,
  cover,
  description,
  nextButtonProps,
  prevButtonProps,
  type: stepType,
  closable,
  classNames: tourClassNames,
  styles,
} = toRefs(reactiveComputed(() => stepProps));

const mergedType = computed(() => stepType?.value ?? type);

const ariaProps = computed(() => pickAttrs(closable.value ?? {}, true));

const [contextLocaleGlobal] = useLocale('global', defaultLocale.global);
const [contextLocaleTour] = useLocale('Tour', defaultLocale.Tour);

const isLastStep = computed(() => current === total.value - 1);

const prevBtnClick = () => {
  onPrev?.value?.();
  prevButtonProps?.value?.onClick?.();
};

const nextBtnClick = () => {
  if (isLastStep.value) {
    onFinish?.value?.();
  } else {
    onNext?.value?.();
  }
  nextButtonProps?.value?.onClick?.();
};

const MergedIndicatorNode = () => {
  let mergedIndicatorNode;
  if (indicatorsRender) {
    mergedIndicatorNode = indicatorsRender(current, total.value);
  } else {
    mergedIndicatorNode = [...Array.from({ length: total.value }).keys()].map((stepItem, index) => (
      <span
        key={stepItem}
        class={clsx(
          index === current && `${prefixCls.value}-indicator-active`,
          `${prefixCls.value}-indicator`,
          tourClassNames.value?.indicator,
        )}
        style={styles.value?.indicator}
      />
    ));
  }
  return mergedIndicatorNode;
};

const mainBtnType = computed(() => (mergedType.value === 'primary' ? 'default' : 'primary'));

const secondaryBtnProps = computed<ButtonProps>(() => ({
  type: 'default',
  ghost: mergedType.value === 'primary',
}));

const DefaultActionsNode = () => (
  <>
    {current !== 0 ? (
      <Button
        size="small"
        {...secondaryBtnProps.value}
        {...prevButtonProps?.value}
        onClick={prevBtnClick}
        class={clsx(`${prefixCls.value}-prev-btn`, prevButtonProps?.value?.className)}
      >
        <Render content={prevButtonProps?.value?.children ?? contextLocaleTour?.value?.Previous}></Render>
      </Button>
    ) : null}
    <Button
      size="small"
      type={mainBtnType.value}
      {...nextButtonProps?.value}
      onClick={nextBtnClick}
      class={clsx(`${prefixCls.value}-next-btn`, nextButtonProps?.value?.className)}
    >
      <Render
        content={
          nextButtonProps?.value?.children ??
          (isLastStep.value ? contextLocaleTour?.value?.Finish : contextLocaleTour?.value?.Next)
        }
      ></Render>
    </Button>
  </>
);
</script>
<template>
  <div :class="`${prefixCls}-pannel`">
    <div :class="clsx(`${prefixCls}-section`, tourClassNames?.section)" :style="styles?.section">
      <button
        v-if="closable"
        v-bind="ariaProps"
        type="button"
        @click="onClose"
        :class="`${prefixCls}-close`"
        :aria-label="contextLocaleGlobal?.close"
      >
        <Render v-if="closable.closeIcon" :content="closable.closeIcon" />
        <CloseOutlined v-else :class="`${prefixCls}-close-icon`" />
      </button>
      <div v-if="isValidNode(cover)" :class="clsx(`${prefixCls}-cover`, tourClassNames?.cover)" :style="styles?.cover">
        <Render :content="cover" />
      </div>
      <div v-if="isValidNode(title)" :class="clsx(`${prefixCls}-header`, tourClassNames?.header)" :style="styles?.header">
        <div :class="clsx(`${prefixCls}-title`, tourClassNames?.title)" :style="styles?.title">
          <Render :content="title" />
        </div>
      </div>
      <div
        v-if="isValidNode(description)"
        :class="clsx(`${prefixCls}-description`, tourClassNames?.description)"
        :style="styles?.description"
      >
        <Render :content="description" />
      </div>
      <div :class="clsx(`${prefixCls}-footer`, tourClassNames?.footer)" :style="styles?.footer">
        <div v-if="total > 1" :class="clsx(`${prefixCls}-indicators`, tourClassNames?.indicators)" :style="styles?.indicators">
          <MergedIndicatorNode />
        </div>
        <div :class="clsx(`${prefixCls}-actions`, tourClassNames?.actions)" :style="styles?.actions">
          <Render v-if="actionsRender" :content="actionsRender(DefaultActionsNode, { current, total })" />
          <DefaultActionsNode />
        </div>
      </div>
    </div>
  </div>
</template>
