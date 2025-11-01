<script lang="tsx" setup>
import KeyCode from '@/vc-util/KeyCode';
import warning from '@/vc-util/warning';
import { computed, getCurrentInstance, ref, toRefs, type VNode } from 'vue';
import { useMenuId } from '../context/IdContext';
import { useMenuContextInject } from '../context/MenuContext';
import { useFullPath } from '../context/PathContext';
import { usePrivateContextInject } from '../context/PrivateContext';
import useActive from '../hooks/useActive';
import useDirectionStyle from '../hooks/useDirectionStyle';
import type { MenuInfo } from '../interface';
import { warnItemProp } from '../utils/warnUtil';
import LegacyMenuItem from './LegacyMenuItem.vue';
import { composeRef } from '@/vc-util/ref';
import { omit } from 'lodash-es';
import clsx from 'clsx';
import Icon from './Icon.vue';
import type { MenuItemProps } from './MenuItem.vue';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  style,
  class: className,

  eventKey,
  warnKey,
  disabled = undefined,
  itemIcon,

  // Aria
  role,

  // Active
  onMouseenter,
  onMouseleave,

  onClick,
  onKeydown,

  onFocus,

  ...restProps
} = defineProps<MenuItemProps>();

const slots = defineSlots<{ default?: () => VNode[] }>();

const domDataId = useMenuId(computed(() => eventKey));

const {
  prefixCls,
  onItemClick,

  disabled: contextDisabled,
  overflowDisabled,

  // Icon
  itemIcon: contextItemIcon,

  // Select
  selectedKeys,

  // Active
  onActive,
} = toRefs(useMenuContextInject());

const { _internalRenderMenuItem } = usePrivateContextInject();

const itemCls = computed(() => `${prefixCls?.value}-item`);

const legacyMenuItemRef = ref<any>();
const mergedDisabled = computed(() => disabled ?? contextDisabled?.value);

const connectedKeys = useFullPath(computed(() => eventKey));

// ================================ Warn ================================
if (process.env.NODE_ENV !== 'production' && warnKey) {
  warning(false, 'MenuItem should not leave undefined `key`.');
}

// ============================= Info =============================
const getEventInfo = (e: MouseEvent | KeyboardEvent): MenuInfo => {
  return {
    key: eventKey,
    // Note: For legacy code is reversed which not like other antd component
    keyPath: [...connectedKeys.value].reverse(),
    item: legacyMenuItemRef.value,
    domEvent: e,
  };
};

// ============================= Icon =============================
const mergedItemIcon = computed(() => itemIcon || contextItemIcon?.value);

// ============================ Active ============================
const activeProps = useActive(
  computed(() => eventKey),
  mergedDisabled,
  onMouseenter,
  onMouseleave,
);

// ============================ Select ============================
const selected = computed(() => selectedKeys?.value.includes(eventKey));

// ======================== DirectionStyle ========================
const directionStyle = useDirectionStyle(computed(() => connectedKeys.value.length));

// ============================ Events ============================
const onInternalClick = (e) => {
  if (mergedDisabled.value) {
    return;
  }

  const info = getEventInfo(e);

  onClick?.(warnItemProp(info));
  onItemClick.value(info);
};

const onInternalKeyDown = (e) => {
  onKeydown?.(e);

  if (e.which === KeyCode.ENTER) {
    const info = getEventInfo(e);

    // Legacy. Key will also trigger click event
    onClick?.(warnItemProp(info));
    onItemClick.value(info);
  }
};

/**
 * Used for accessibility. Helper will focus element without key board.
 * We should manually trigger an active
 */
const onInternalFocus = (e) => {
  onActive.value(eventKey);
  onFocus?.(e);
};

// ============================ Render ============================
const optionRoleProps = computed(() => {
  const result = {};

  if (role === 'option') {
    result['aria-selected'] = selected.value;
  }
  return result;
});

const vm = getCurrentInstance();

const RenderNode = ({ style }) => {
  let result = (
    <LegacyMenuItem
      ref={composeRef((el) => (legacyMenuItemRef.value = el?.el))}
      role={role === null ? 'none' : role || 'menuitem'}
      tabindex={disabled ? null : -1}
      data-menu-id={overflowDisabled?.value && domDataId.value ? null : domDataId.value}
      {...omit(restProps, ['extra'])}
      {...omit(activeProps.value, ['active'])}
      {...optionRoleProps.value}
      component="li"
      aria-disabled={disabled}
      style={{
        ...directionStyle.value,
        ...style,
      }}
      class={clsx(
        itemCls.value,
        {
          [`${itemCls.value}-active`]: activeProps.value.active,
          [`${itemCls.value}-selected`]: selected.value,
          [`${itemCls.value}-disabled`]: mergedDisabled.value,
        },
        className,
      )}
      onMousedown={onInternalClick}
      onKeydown={onInternalKeyDown}
      onFocus={onInternalFocus}
    >
      {slots.default?.()}
      <Icon
        props={{
          ...vm.props,
          isSelected: selected.value,
        }}
        icon={mergedItemIcon.value}
      />
    </LegacyMenuItem>
  );

  if (_internalRenderMenuItem) {
    result = _internalRenderMenuItem(result, vm.props, { selected: selected.value });
  }
  return result;
};

defineExpose({
  get el() {
    return legacyMenuItemRef.value;
  },
});
</script>
<template>
  <RenderNode :style="style" />
</template>
