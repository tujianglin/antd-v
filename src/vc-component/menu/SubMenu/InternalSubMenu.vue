<script lang="tsx" setup>
import warning from '@/vc-util/warning';
import { computed, getCurrentInstance, ref, toRefs, useSlots } from 'vue';
import { useMenuId } from '../context/IdContext';
import { useMenuContextInject, MenuContextProvider } from '../context/MenuContext';
import { useFullPath, usePathUserContextInject } from '../context/PathContext';
import { usePrivateContextInject } from '../context/PrivateContext';
import useActive from '../hooks/useActive';
import useDirectionStyle from '../hooks/useDirectionStyle';
import useMemoCallback from '../hooks/useMemoCallback';
import type { SubMenuProps } from './index.vue';
import Icon from '../MenuItem/Icon.vue';
import Overflow from '@/vc-component/overflow';
import clsx from 'clsx';
import type { MenuInfo } from '../interface';
import { warnItemProp } from '../utils/warnUtil';
import PopupTrigger from './PopupTrigger.vue';
import SubMenuList from './SubMenuList.vue';
import InlineSubMenuList from './InlineSubMenuList.vue';
import { Render } from '@/components';
import { omit } from 'lodash-es';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  style,
  class: className,

  styles,
  classNames: menuClassNames,

  title,
  eventKey,
  warnKey,

  disabled,
  internalPopupClose,

  // Icons
  itemIcon,
  expandIcon,
  children: _,

  // Popup
  popupClassName,
  popupOffset,
  popupStyle,

  // Events
  onClick,
  onMouseenter,
  onMouseleave,
  onTitleClick,
  onTitleMouseEnter,
  onTitleMouseLeave,
  popupRender: propsPopupRender,
  ...restProps
} = defineProps<SubMenuProps>();

const {
  prefixCls,
  mode,
  openKeys,

  // Disabled
  disabled: contextDisabled,
  overflowDisabled,

  // ActiveKey
  activeKey,

  // SelectKey
  selectedKeys,

  // Icon
  itemIcon: contextItemIcon,
  expandIcon: contextExpandIcon,

  // Events
  onItemClick,
  onOpenChange,

  onActive,
  popupRender: contextPopupRender,
} = toRefs(useMenuContextInject());

const domDataId = useMenuId(computed(() => eventKey));

const { _internalRenderSubMenuItem } = usePrivateContextInject();

const { isSubPathKey } = usePathUserContextInject();
const connectedPath = useFullPath();

const subMenuPrefixCls = computed(() => `${prefixCls?.value}-submenu`);
const mergedDisabled = computed(() => contextDisabled?.value || disabled);
const elementRef = ref<HTMLDivElement>();
const popupRef = ref<HTMLUListElement>();

// ================================ Warn ================================
if (process.env.NODE_ENV !== 'production' && warnKey) {
  warning(false, 'SubMenu should not leave undefined `key`.');
}

// ================================ Icon ================================
const mergedItemIcon = computed(() => itemIcon ?? contextItemIcon?.value);
const mergedExpandIcon = computed(() => expandIcon ?? contextExpandIcon?.value);

// ================================ Open ================================
const originOpen = computed(() => openKeys?.value?.includes(eventKey));

const open = computed(() => !overflowDisabled?.value && originOpen.value);

// =============================== Select ===============================
const childrenSelected = computed(() => isSubPathKey(selectedKeys.value, eventKey));

// =============================== Active ===============================
const activeProps = useActive(
  computed(() => eventKey),
  mergedDisabled,
  onTitleMouseEnter,
  onTitleMouseLeave,
);

// Fallback of active check to avoid hover on menu title or disabled item
const childrenActive = ref(false);

const triggerChildrenActive = (newActive: boolean) => {
  if (!mergedDisabled.value) {
    childrenActive.value = newActive;
  }
};

const onInternalMouseEnter = (domEvent) => {
  triggerChildrenActive(true);
  onMouseenter?.({
    key: eventKey,
    domEvent,
  });
};

const onInternalMouseLeave = (domEvent) => {
  triggerChildrenActive(false);

  onMouseleave?.({
    key: eventKey,
    domEvent,
  });
};

const mergedActive = computed(() => {
  if (activeProps.value?.active) {
    return activeProps.value?.active;
  }

  if (mode.value !== 'inline') {
    return childrenActive.value || isSubPathKey([activeKey?.value], eventKey);
  }
  return false;
});

// ========================== DirectionStyle ==========================
const directionStyle = useDirectionStyle(computed(() => connectedPath?.value.length));

// =============================== Events ===============================
// >>>> Title click
const onInternalTitleClick = (e) => {
  // Skip if disabled
  if (mergedDisabled.value) {
    return;
  }

  onTitleClick?.({
    key: eventKey,
    domEvent: e,
  });

  // Trigger open by click when mode is `inline`
  if (mode.value === 'inline') {
    onOpenChange.value(eventKey, !originOpen.value);
  }
};

// >>>> Context for children click
const onMergedItemClick = useMemoCallback((info: MenuInfo) => {
  onClick?.(warnItemProp(info));
  onItemClick.value(info);
});

// >>>>> Visible change
const onPopupVisibleChange = (newVisible: boolean) => {
  if (mode.value !== 'inline') {
    onOpenChange.value(eventKey, newVisible);
  }
};

/**
 * Used for accessibility. Helper will focus element without key board.
 * We should manually trigger an active
 */
const onInternalFocus = () => {
  onActive.value(eventKey);
};

// =============================== Render ===============================
const popupId = computed(() => domDataId.value && `${domDataId.value}-popup`);

const vm = getCurrentInstance();

const ExpandIconNode = () => {
  return (
    <Icon
      icon={mode.value !== 'horizontal' ? mergedExpandIcon.value : undefined}
      props={{
        ...vm.props,
        isOpen: open.value,
        // [Legacy] Not sure why need this mark
        isSubMenu: true,
      }}
    >
      <i class={`${subMenuPrefixCls?.value}-arrow`} />
    </Icon>
  );
};

// >>>>> Title
const TitleNode = () => {
  return (
    <div
      role="menuitem"
      style={directionStyle.value}
      class={`${subMenuPrefixCls.value}-title`}
      tabindex={mergedDisabled?.value ? null : -1}
      ref={elementRef}
      title={typeof title === 'string' ? title : null}
      data-menu-id={overflowDisabled?.value && domDataId?.value ? null : domDataId?.value}
      aria-expanded={open.value}
      aria-haspopup
      aria-controls={popupId.value}
      aria-disabled={mergedDisabled.value}
      onClick={onInternalTitleClick}
      onFocus={onInternalFocus}
      {...omit(activeProps.value, ['active'])}
    >
      <Render content={title}></Render>
      {/* Only non-horizontal mode shows the icon */}
      <ExpandIconNode></ExpandIconNode>
    </div>
  );
};

// Cache mode if it change to `inline` which do not have popup motion
const triggerModeRef = computed(() => {
  let result = mode.value;
  if (mode.value !== 'inline' && connectedPath.value.length > 1) {
    result = 'vertical';
  } else {
    result = mode.value;
  }
  return result;
});

const popupContentTriggerMode = computed(() => triggerModeRef.value);
const slots = useSlots();
const renderPopupContent = () => {
  const originNode = (
    <MenuContextProvider
      value={{
        classNames: menuClassNames,
        styles,
        mode: popupContentTriggerMode.value === 'horizontal' ? 'vertical' : popupContentTriggerMode.value,
      }}
    >
      <SubMenuList id={popupId.value} ref={popupRef}>
        {slots?.default?.()}
      </SubMenuList>
    </MenuContextProvider>
  );
  const mergedPopupRender = propsPopupRender || contextPopupRender?.value;
  if (mergedPopupRender) {
    const node = mergedPopupRender(originNode, {
      item: vm.props,
      keys: connectedPath.value,
    });
    return node;
  }
  return originNode;
};

const domRef = ref();

defineExpose({
  get el() {
    return domRef.value || {};
  },
});

// >>>>> List node
const ListNode = () => {
  let result = (
    <Overflow.Item
      ref={(el: any) => (domRef.value = el?.el)}
      role="none"
      {...restProps}
      component="li"
      style={style}
      class={clsx(subMenuPrefixCls.value, `${subMenuPrefixCls.value}-${mode.value}`, className, {
        [`${subMenuPrefixCls.value}-open`]: open.value,
        [`${subMenuPrefixCls.value}-active`]: mergedActive.value,
        [`${subMenuPrefixCls.value}-selected`]: childrenSelected.value,
        [`${subMenuPrefixCls.value}-disabled`]: mergedDisabled.value,
      })}
      onMouseenter={onInternalMouseEnter}
      onMouseleave={onInternalMouseLeave}
    >
      {!overflowDisabled?.value ? (
        <PopupTrigger
          mode={triggerModeRef.value}
          prefixCls={subMenuPrefixCls.value}
          visible={!internalPopupClose && open.value && mode.value !== 'inline'}
          popupClassName={popupClassName}
          popupOffset={popupOffset}
          popupStyle={popupStyle}
          popup={renderPopupContent}
          disabled={mergedDisabled?.value}
          onVisibleChange={onPopupVisibleChange}
        >
          {{
            default: (props) => <TitleNode {...props}></TitleNode>,
          }}
        </PopupTrigger>
      ) : (
        <TitleNode></TitleNode>
      )}
      {!overflowDisabled?.value && (
        <InlineSubMenuList id={popupId.value} open={open.value} keyPath={connectedPath.value}>
          {slots?.default?.()}
        </InlineSubMenuList>
      )}
    </Overflow.Item>
  );

  if (_internalRenderSubMenuItem) {
    result = _internalRenderSubMenuItem(result, vm.props, {
      selected: childrenSelected.value,
      active: mergedActive.value,
      open: open.value,
      disabled: mergedDisabled.value,
    });
  }
  return result;
};
</script>
<template>
  <MenuContextProvider
    :value="{
      classNames: menuClassNames,
      styles,
      onItemClick: onMergedItemClick,
      mode: mode === 'horizontal' ? 'vertical' : mode,
      itemIcon: mergedItemIcon,
      expandIcon: mergedExpandIcon,
    }"
  >
    <ListNode />
  </MenuContextProvider>
</template>
