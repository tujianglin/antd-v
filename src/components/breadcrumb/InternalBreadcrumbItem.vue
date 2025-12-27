<script lang="tsx" setup>
import type { VueNode } from '@/vc-util/type';
import { computed, toRefs, useSlots } from 'vue';
import type { DropdownProps } from '../dropdown';
import { useBreadcrumbContextInject } from './BreadcrumbContext';
import Dropdown from '../dropdown';
import { DownOutlined } from '@ant-design/icons-vue';
import Render from '@/vc-component/render';
import BreadcrumbSeparator from './BreadcrumbSeparator.vue';
import type { BreadcrumbItemProps } from './BreadcrumbItem.vue';
import { flattenChildren } from '@/vc-util/Dom/findDOMNode';
import clsx from 'clsx';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, separator = '/', menu, dropdownProps, href } = defineProps<Omit<BreadcrumbItemProps, 'key'>>();
const breadcrumbContext = useBreadcrumbContextInject();
const { classNames: mergedClassNames, styles: mergedStyles } = toRefs(breadcrumbContext);
/** If overlay is have Wrap a Dropdown */
const renderBreadcrumbNode = (breadcrumbItem: VueNode) => {
  if (menu) {
    const mergeDropDownProps: DropdownProps = {
      ...dropdownProps,
    };

    const { items, ...menuProps } = menu || {};
    mergeDropDownProps.menu = {
      ...menuProps,
      items: items?.map(({ key, title, label, path, ...itemProps }, index) => {
        let mergedLabel: VueNode = label ?? title;

        if (path) {
          mergedLabel = (
            <a href={`${href}${path}`}>
              <Render content={mergedLabel}></Render>
            </a>
          );
        }
        return {
          ...itemProps,
          key: key ?? index,
          label: mergedLabel,
        };
      }),
    };

    return (
      <Dropdown placement="bottom" {...mergeDropDownProps}>
        <span class={`${prefixCls}-overlay-link`}>
          <Render content={breadcrumbItem}></Render>
          <DownOutlined />
        </span>
      </Dropdown>
    );
  }
  return breadcrumbItem;
};

const slots = useSlots();

const link = computed(() => renderBreadcrumbNode(flattenChildren(slots.default?.())));
</script>
<template>
  <template v-if="link !== undefined && link !== null">
    <li :class="clsx(`${prefixCls}-item`, mergedClassNames?.item)" :style="mergedStyles?.item">
      <Render :content="link" />
    </li>
    <BreadcrumbSeparator v-if="separator"><Render :content="separator" /></BreadcrumbSeparator>
  </template>
</template>
