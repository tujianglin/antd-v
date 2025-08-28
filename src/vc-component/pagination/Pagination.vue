<script lang="tsx" setup>
import { cloneVNode, computed, createVNode, getCurrentInstance, ref, watch } from 'vue';
import type { PaginationProps } from './interface';
import zhCN from './locale/zh_CN';
import KeyCode from '@/vc-util/KeyCode';
import { isValidElement } from '@/components/_util/isValidNode';
import pickAttrs from '@/vc-util/pickAttrs';
import type { PagerProps } from './Pager.vue';
import { Render } from '@/components';
import Pager from './Pager.vue';
import clsx from 'clsx';
import Options from './Options.vue';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  // cls
  prefixCls = 'rc-pagination',
  selectPrefixCls = 'rc-select',
  class: className,
  classNames: paginationClassNames,
  styles,

  // control
  total = 0,
  onChange = () => {},

  // config
  hideOnSinglePage,
  align,
  showPrevNextJumpers = true,
  showQuickJumper,
  showLessItems,
  showTitle = true,
  onShowSizeChange = () => {},
  locale = zhCN,
  style,
  totalBoundaryShowSizeChanger = 50,
  disabled,
  simple,
  showTotal,
  showSizeChanger: defaultShowSizeChanger,
  sizeChangerRender,
  pageSizeOptions,

  // render
  itemRender: defaultItemRender,
  jumpPrevIcon,
  jumpNextIcon,
  prevIcon,
  nextIcon,
} = defineProps<PaginationProps>();

function calculatePage(p: number | undefined, pageSize: number, total: number) {
  const _pageSize = typeof p === 'undefined' ? pageSize : p;
  return Math.floor((total - 1) / _pageSize) + 1;
}

function isInteger(v: number) {
  const value = Number(v);
  return typeof value === 'number' && !Number.isNaN(value) && isFinite(value) && Math.floor(value) === value;
}

const showSizeChanger = computed(() => defaultShowSizeChanger || total > totalBoundaryShowSizeChanger);
const itemRender = computed<any>(() => defaultItemRender || ((_, __, element) => element));

const paginationRef = ref<HTMLUListElement>(null);

const pageSize = defineModel('pageSize', { default: 10 });

const current = defineModel('current', {
  default: 1,
  get: (val) => Math.max(1, Math.min(val, calculatePage(undefined, pageSize.value, total))),
});

const internalInputVal = ref(current.value);

watch(
  current,
  () => {
    internalInputVal.value = current.value;
  },
  { immediate: true },
);

const jumpPrevPage = computed(() => Math.max(1, current.value - (showLessItems ? 3 : 5)));
const jumpNextPage = computed(() =>
  Math.min(calculatePage(undefined, pageSize.value, total), current.value + (showLessItems ? 3 : 5)),
);

const vm = getCurrentInstance();
function getItemIcon(icon: any, label: string) {
  let iconNode = icon || <button type="button" aria-label={label} class={`${prefixCls}-item-link`} />;
  if (typeof icon === 'function') {
    iconNode = createVNode(icon, vm.props);
  }
  return iconNode as any;
}

function getValidValue(e: any): number {
  const inputValue = e.target.value;
  const allPages = calculatePage(undefined, pageSize.value, total);
  let value: number;
  if (inputValue === '') {
    value = inputValue;
  } else if (Number.isNaN(Number(inputValue))) {
    value = internalInputVal.value;
  } else if (inputValue >= allPages) {
    value = allPages;
  } else {
    value = Number(inputValue);
  }
  return value;
}

function isValid(page: number) {
  return isInteger(page) && page !== current.value && isInteger(total) && total > 0;
}

const shouldDisplayQuickJumper = computed(() => (total > pageSize.value ? showQuickJumper : false));

/**
 * prevent "up arrow" key reseting cursor position within textbox
 * @see https://stackoverflow.com/a/1081114
 */
function handleKeyDown(event: KeyboardEvent) {
  if (event.keyCode === KeyCode.UP || event.keyCode === KeyCode.DOWN) {
    event.preventDefault();
  }
}

function handleKeyUp(event) {
  const value = getValidValue(event);
  if (value !== internalInputVal.value) {
    internalInputVal.value = value;
  }

  switch (event) {
    case KeyCode.ENTER:
      handleChange(value);
      break;
    case KeyCode.UP:
      handleChange(value - 1);
      break;
    case KeyCode.DOWN:
      handleChange(value + 1);
      break;
    default:
      break;
  }
}

function handleBlur(event: FocusEvent) {
  handleChange(getValidValue(event));
}

function changePageSize(size: number) {
  const newCurrent = calculatePage(size, pageSize.value, total);
  const nextCurrent = current.value > newCurrent && newCurrent !== 0 ? newCurrent : current.value;

  pageSize.value = size;
  internalInputVal.value = newCurrent;
  onShowSizeChange?.(current.value, size);
  current.value = newCurrent;
  onChange?.(nextCurrent, size);
}

function handleChange(page: number) {
  if (isValid(page) && !disabled) {
    const currentPage = calculatePage(undefined, pageSize.value, total);
    let newPage = page;
    if (page > currentPage) {
      newPage = currentPage;
    } else if (page < 1) {
      newPage = 1;
    }

    if (newPage !== internalInputVal.value) {
      internalInputVal.value = newPage;
    }
    current.value = newPage;
    onChange?.(newPage, pageSize.value);

    return newPage;
  }

  return current.value;
}

const hasPrev = computed(() => current.value > 1);
const hasNext = computed(() => current.value < calculatePage(undefined, pageSize.value, total));

function prevHandle() {
  if (hasPrev.value) handleChange(current.value - 1);
}

function nextHandle() {
  if (hasNext.value) handleChange(current.value + 1);
}

function jumpPrevHandle() {
  handleChange(jumpPrevPage.value);
}

function jumpNextHandle() {
  handleChange(jumpNextPage.value);
}

function runIfEnter(event: KeyboardEvent, callback: (...args: any[]) => void, ...restParams: any[]) {
  if (event.key === 'Enter' || event.charCode === KeyCode.ENTER || event.keyCode === KeyCode.ENTER) {
    callback(...restParams);
  }
}

function runIfEnterPrev(event: KeyboardEvent) {
  runIfEnter(event, prevHandle);
}

function runIfEnterNext(event: KeyboardEvent) {
  runIfEnter(event, nextHandle);
}

function runIfEnterJumpPrev(event: KeyboardEvent) {
  runIfEnter(event, jumpPrevHandle);
}

function runIfEnterJumpNext(event: KeyboardEvent) {
  runIfEnter(event, jumpNextHandle);
}

function renderPrev(prevPage: number) {
  const prevButton = itemRender.value(prevPage, 'prev', getItemIcon(prevIcon, 'prev page'));
  return isValidElement(prevButton) ? cloneVNode(prevButton, { disabled: !hasPrev.value }) : prevButton;
}

function renderNext(nextPage: number) {
  const nextButton = itemRender.value(nextPage, 'next', getItemIcon(nextIcon, 'next page'));
  return isValidElement(nextButton) ? cloneVNode(nextButton, { disabled: !hasNext.value }) : nextButton;
}

function handleGoTO(event: any) {
  if (event.type === 'click' || event.keyCode === KeyCode.ENTER) {
    handleChange(internalInputVal.value);
  }
}

const dataOrAriaAttributeProps = computed(() =>
  pickAttrs(vm.props, {
    aria: true,
    data: true,
  }),
);

const totalText = () => {
  return (
    showTotal && (
      <li class={`${prefixCls}-total-text`}>
        {showTotal(total, [
          total === 0 ? 0 : (current.value - 1) * pageSize.value + 1,
          current.value * pageSize.value > total ? total : current.value * pageSize.value,
        ])}
      </li>
    )
  );
};

const allPages = computed(() => calculatePage(undefined, pageSize.value, total));

const pagerProps = computed<PagerProps>(() => {
  return {
    rootPrefixCls: prefixCls,
    onClick: handleChange,
    onKeypress: runIfEnter,
    showTitle,
    itemRender: itemRender.value,
    page: -1,
    class: paginationClassNames?.item,
    style: styles?.item,
  };
});

const prevPage = computed(() => (current.value - 1 > 0 ? current.value - 1 : 0));
const nextPage = computed(() => (current.value + 1 < allPages.value ? current.value + 1 : allPages.value));
const goButton = computed(() => showQuickJumper && (showQuickJumper as any).goButton);

// ================== Simple ==================
// FIXME: ts type
const isReadOnly = computed(() => (typeof simple === 'object' ? simple.readOnly : !simple));
const gotoButton = (): any => {
  let result = <Render content={goButton.value}></Render>;
  if (simple) {
    if (goButton.value) {
      if (typeof goButton.value === 'boolean') {
        result = (
          <button type="button" onClick={handleGoTO} onKeyup={handleGoTO}>
            <Render content={locale.jump_to_confirm}></Render>
          </button>
        );
      } else {
        result = (
          <span onClick={handleGoTO} onKeyup={handleGoTO}>
            <Render content={goButton.value}></Render>
          </span>
        );
      }

      result = (
        <li title={showTitle ? `${locale.jump_to}${current.value}/${allPages.value}` : null} class={`${prefixCls}-simple-pager`}>
          <Render content={result}></Render>
        </li>
      );
    }
  }
  return result;
};

const simplePager = () => {
  let result = null;
  if (simple) {
    result = (
      <li title={showTitle ? `${current.value}/${allPages.value}` : null} class={`${prefixCls}-simple-pager`}>
        {isReadOnly.value ? (
          <Render content={internalInputVal.value}></Render>
        ) : (
          <input
            type="text"
            aria-label={locale.jump_to}
            value={internalInputVal.value}
            disabled={disabled}
            onKeydown={handleKeyDown}
            onKeyup={handleKeyUp}
            onChange={handleKeyUp}
            onBlur={handleBlur}
            size={3}
          />
        )}
        <span class={`${prefixCls}-slash`}>/</span>
        <Render content={allPages.value}></Render>
      </li>
    );
  }
  return result;
};

// ====================== Normal ======================
const pageBufferSize = computed(() => (showLessItems ? 1 : 2));

const jumpPrev = () => {
  let result = null;
  if (allPages.value <= 3 + pageBufferSize.value * 2) return result;
  const prevItemTitle = showLessItems ? locale.prev_3 : locale.prev_5;
  const jumpPrevContent = itemRender.value(jumpPrevPage.value, 'jump-prev', getItemIcon(jumpPrevIcon, 'prev page'));
  if (showPrevNextJumpers) {
    result = jumpPrevContent ? (
      <li
        title={showTitle ? prevItemTitle : null}
        key="prev"
        onClick={jumpPrevHandle}
        tabindex={0}
        onKeydown={runIfEnterJumpPrev}
        class={clsx(`${prefixCls}-jump-prev`, {
          [`${prefixCls}-jump-prev-custom-icon`]: !!jumpPrevIcon,
        })}
      >
        {jumpPrevContent}
      </li>
    ) : null;
  }
  return result;
};

const jumpNext = () => {
  let result = null;
  if (allPages.value <= 3 + pageBufferSize.value * 2) return result;
  const nextItemTitle = showLessItems ? locale.next_3 : locale.next_5;
  const jumpNextContent = itemRender.value(jumpNextPage.value, 'jump-next', getItemIcon(jumpNextIcon, 'next page'));
  if (showPrevNextJumpers) {
    result = jumpNextContent ? (
      <li
        title={showTitle ? nextItemTitle : null}
        key="next"
        onClick={jumpNextHandle}
        tabindex={0}
        onKeydown={runIfEnterJumpNext}
        class={clsx(`${prefixCls}-jump-next`, {
          [`${prefixCls}-jump-next-custom-icon`]: !!jumpNextIcon,
        })}
      >
        {jumpNextContent}
      </li>
    ) : null;
  }
  return result;
};
const pagerList = () => {
  const result = [];
  if (allPages.value <= 3 + pageBufferSize.value * 2) {
    if (!allPages.value) {
      result.push(<Pager {...pagerProps.value} key="noPager" page={1} class={`${prefixCls}-item-disabled`} />);
    }

    for (let i = 1; i <= allPages.value; i += 1) {
      result.push(<Pager {...pagerProps.value} key={i} page={i} active={current.value === i} />);
    }
  } else {
    let left = Math.max(1, current.value - pageBufferSize.value);
    let right = Math.min(current.value + pageBufferSize.value, allPages.value);

    if (current.value - 1 <= pageBufferSize.value) {
      right = 1 + pageBufferSize.value * 2;
    }
    if (allPages.value - current.value <= pageBufferSize.value) {
      left = allPages.value - pageBufferSize.value * 2;
    }

    for (let i = left; i <= right; i += 1) {
      result.push(<Pager {...pagerProps.value} key={i} page={i} active={current.value === i} />);
    }

    if (current.value - 1 >= pageBufferSize.value * 2 && current.value !== 1 + 2) {
      result[0] = cloneVNode(result[0], {
        class: clsx(`${prefixCls}-item-after-jump-prev`, result[0].props.className),
      });

      result.unshift(jumpPrev());
    }

    if (allPages.value - current.value >= pageBufferSize.value * 2 && current.value !== allPages.value - 2) {
      const lastOne = result[result.length - 1];
      result[result.length - 1] = cloneVNode(lastOne, {
        class: clsx(`${prefixCls}-item-before-jump-next`, lastOne.props.class),
      });

      result.push(jumpNext());
    }

    if (left !== 1) {
      result.unshift(<Pager {...pagerProps.value} key={1} page={1} />);
    }
    if (right !== allPages.value) {
      result.push(<Pager {...pagerProps.value} key={allPages.value} page={allPages.value} />);
    }
  }
  return result;
};

const prev = () => {
  let result = renderPrev(prevPage.value);
  if (result) {
    const prevDisabled = !hasPrev.value || !allPages.value;
    result = (
      <li
        title={showTitle ? locale.prev_page : null}
        onClick={prevHandle}
        tabindex={prevDisabled ? null : 0}
        onKeydown={runIfEnterPrev}
        class={clsx(`${prefixCls}-prev`, paginationClassNames?.item, {
          [`${prefixCls}-disabled`]: prevDisabled,
        })}
        style={styles?.item}
        aria-disabled={prevDisabled}
      >
        <Render content={result}></Render>
      </li>
    );
  } else {
    result = <Render content={result}></Render>;
  }
  return result;
};

const next = () => {
  let result = renderNext(nextPage.value);
  if (result) {
    let nextDisabled: boolean, nextTabIndex: number | null;

    if (simple) {
      nextDisabled = !hasNext.value;
      nextTabIndex = hasPrev.value ? 0 : null;
    } else {
      nextDisabled = !hasNext.value || !allPages.value;
      nextTabIndex = nextDisabled ? null : 0;
    }
    result = (
      <li
        title={showTitle ? locale.next_page : null}
        onClick={nextHandle}
        tabindex={nextTabIndex ? null : 0}
        onKeydown={runIfEnterNext}
        class={clsx(`${prefixCls}-next`, paginationClassNames?.item, {
          [`${prefixCls}-disabled`]: nextDisabled,
        })}
        style={styles?.item}
        aria-disabled={nextDisabled}
      >
        <Render content={result}></Render>
      </li>
    );
  } else {
    result = <Render content={result}></Render>;
  }
  return result;
};

const cls = computed(() => {
  return clsx(prefixCls, className, {
    [`${prefixCls}-start`]: align === 'start',
    [`${prefixCls}-center`]: align === 'center',
    [`${prefixCls}-end`]: align === 'end',
    [`${prefixCls}-simple`]: simple,
    [`${prefixCls}-disabled`]: disabled,
  });
});
</script>
<template>
  <template v-if="hideOnSinglePage && total <= pageSize"></template>
  <ul v-else :class="cls" :style="style" ref="paginationRef" v-bind="dataOrAriaAttributeProps">
    <Render :content="totalText" />
    <Render :content="prev" />
    <Render :content="simple ? simplePager : pagerList" />
    <Render :content="next" />
    <Options
      :locale="locale"
      :root-prefix-cls="prefixCls"
      :disabled="disabled"
      :select-prefix-cls="selectPrefixCls"
      :change-size="changePageSize"
      :page-size="pageSize"
      :page-size-options="pageSizeOptions"
      :quick-go="shouldDisplayQuickJumper ? handleChange : null"
      :go-button="gotoButton"
      :show-size-changer="showSizeChanger"
      :size-changer-render="sizeChangerRender"
    />
  </ul>
</template>
<style lang="less">
@import './assets/index.less';
</style>
