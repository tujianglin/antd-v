<script lang="tsx" setup>
import KeyCode from '@/vc-util/KeyCode';
import clsx from 'clsx';
import { computed, getCurrentInstance } from 'vue';
import Render from '@/vc-component/render';

export interface StarProps {
  value?: number;
  index?: number;
  prefixCls?: string;
  allowHalf?: boolean;
  disabled?: boolean;
  onHover?: (e: MouseEvent, index: number) => void;
  onClick?: (e: MouseEvent | KeyboardEvent, index: number) => void;
  character?: any | ((props: StarProps) => any);
  characterRender?: (origin: any, props: StarProps) => any;
  focused?: boolean;
  count?: number;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { disabled, prefixCls, character, characterRender, index, count, value, allowHalf, focused, onHover, onClick } =
  defineProps<StarProps>();

// =========================== Events ===========================
const onInternalHover = (e) => {
  onHover(e, index);
};

const onInternalClick = (e) => {
  onClick(e, index);
};

const onInternalKeyDown = (e) => {
  if (e.keyCode === KeyCode.ENTER) {
    onClick(e, index);
  }
};

// =========================== Render ===========================
// >>>>> ClassName
const starValue = computed(() => index + 1);
const classNameList = computed(() => {
  const result = new Set([prefixCls]);

  // TODO: Current we just refactor from CC to FC. This logic seems can be optimized.
  if (value === 0 && index === 0 && focused) {
    result.add(`${prefixCls}-focused`);
  } else if (allowHalf && value + 0.5 >= starValue.value && value < starValue.value) {
    result.add(`${prefixCls}-half`);
    result.add(`${prefixCls}-active`);
    if (focused) {
      result.add(`${prefixCls}-focused`);
    }
  } else {
    if (starValue.value <= value) {
      result.add(`${prefixCls}-full`);
    } else {
      result.add(`${prefixCls}-zero`);
    }
    if (starValue.value === value && focused) {
      result.add(`${prefixCls}-focused`);
    }
  }
  return result;
});

// >>>>> Node
const vm = getCurrentInstance();
const characterNode = computed(() => (typeof character === 'function' ? character(vm.props) : character));

const changeRef = (instance) => {
  vm.exposed = instance || {};
  vm.exposeProxy = instance || {};
};
const Start = () => {
  let result = (
    <li class={clsx(Array.from(classNameList.value))} ref={changeRef}>
      <div
        onClick={disabled ? null : onInternalClick}
        onKeydown={disabled ? null : onInternalKeyDown}
        onMousemove={disabled ? null : onInternalHover}
        role="radio"
        aria-checked={value > index ? 'true' : 'false'}
        aria-posinset={index + 1}
        aria-setsize={count}
        tabindex={disabled ? -1 : 0}
      >
        <div class={`${prefixCls}-first`}>
          <Render content={characterNode.value}></Render>
        </div>
        <div class={`${prefixCls}-second`}>
          <Render content={characterNode.value}></Render>
        </div>
      </div>
    </li>
  );

  if (characterRender) {
    result = characterRender(result, vm.props);
  }
  return result;
};
</script>
<template>
  <Start />
</template>
