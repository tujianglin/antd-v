<script lang="tsx" setup>
import type { VueNode } from '@/vc-util/type';
import Button from '../button';
import type { DirectionType } from '../config-provider';
import { cloneVNode, computed, defineComponent, type CSSProperties, type PropType } from 'vue';
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue';
import { isValidElement } from '../_util/isValidNode';
import Render from '../render';

export interface TransferOperationProps {
  class?: string;
  actions: VueNode[];
  moveToLeft?: (e: MouseEvent) => void;
  moveToRight?: (e: MouseEvent) => void;
  leftActive?: boolean;
  rightActive?: boolean;
  style?: CSSProperties;
  disabled?: boolean;
  direction?: DirectionType;
  oneWay?: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { class: className, style, oneWay, actions, ...restProps } = defineProps<TransferOperationProps>();

function getArrowIcon(type: 'left' | 'right', direction?: DirectionType) {
  const isRight = type === 'right';
  if (direction !== 'rtl') {
    return isRight ? <RightOutlined /> : <LeftOutlined />;
  }
  return isRight ? <LeftOutlined /> : <RightOutlined />;
}

const Action = defineComponent({
  inheritAttrs: false,
  props: {
    type: { type: String as PropType<'left' | 'right'>, required: true },
    actions: { type: Array as PropType<VueNode[]>, required: true },
    moveToLeft: { type: Function as PropType<(e: MouseEvent) => void> },
    moveToRight: { type: Function as PropType<(e: MouseEvent) => void> },
    leftActive: { type: Boolean },
    rightActive: { type: Boolean },
    direction: { type: String as PropType<DirectionType> },
    disabled: { type: Boolean },
  },
  setup(props) {
    const isRight = computed(() => props?.type === 'right');
    const button = computed(() => (isRight.value ? props.actions[0] : props.actions[1]));
    const moveHandler = computed(() => (isRight.value ? props.moveToRight : props.moveToLeft));
    const active = computed(() => (isRight.value ? props.rightActive : props.leftActive));
    const icon = computed(() => getArrowIcon(props.type, props.direction));

    return () => {
      if (isValidElement(button.value)) {
        const element = button.value as any;
        const onClick: (e: MouseEvent) => void = (event) => {
          element?.props?.onClick?.(event);
          moveHandler?.value?.(event);
        };
        return cloneVNode(element, {
          disabled: props.disabled || !active.value,
          onClick,
        });
      }
      return (
        <Button
          type="primary"
          size="small"
          disabled={props.disabled || !active.value}
          onClick={(event: MouseEvent) => moveHandler?.value?.(event)}
          icon={icon.value}
        >
          {button.value && <Render content={button.value}></Render>}
        </Button>
      );
    };
  },
});
</script>
<template>
  <div :class="className" :style="style">
    <Action v-bind="restProps" type="right" :actions="actions" />
    <Action v-if="!oneWay" v-bind="restProps" type="left" :actions="actions" />
    <Render :content="actions.slice(oneWay ? 1 : 2)" />
  </div>
</template>
