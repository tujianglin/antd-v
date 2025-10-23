<script lang="tsx" setup>
import type { InternalDescriptionsItemType } from './index.vue';
import Cell from './Cell.vue';
import { useDescriptionsContextInject, type DescriptionsContextProps } from './DescriptionsContext';
import Render from '@/vc-component/render';

interface CellConfig {
  component: string | [string, string];
  type: 'label' | 'content' | 'item';
  showLabel?: boolean;
  showContent?: boolean;
}

export interface RowProps {
  prefixCls: string;
  vertical: boolean;
  row: InternalDescriptionsItemType[];
  bordered?: boolean;
  colon: boolean;
  index: number;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, vertical, row, index, bordered } = defineProps<RowProps>();

function renderCells(
  items: InternalDescriptionsItemType[],
  { colon, prefixCls, bordered }: RowProps,
  { component, type, showLabel, showContent, styles: rootStyles }: CellConfig & DescriptionsContextProps,
) {
  return () =>
    items.map(
      ({ label, children, prefixCls: itemPrefixCls = prefixCls, class: className, style, span = 1, key, styles }, index) => {
        if (typeof component === 'string') {
          return (
            <Cell
              key={`${type}-${key || index}`}
              class={className}
              style={style}
              styles={{
                label: {
                  ...rootStyles?.label,
                  ...styles?.label,
                },
                content: {
                  ...rootStyles?.content,
                  ...styles?.content,
                },
              }}
              span={span}
              colon={colon}
              component={component}
              itemPrefixCls={itemPrefixCls}
              bordered={bordered}
              label={showLabel ? label : null}
              content={showContent ? children : null}
              type={type}
            />
          );
        }

        return [
          <Cell
            key={`label-${key || index}`}
            class={className}
            style={{
              ...rootStyles?.label,
              ...style,
              ...styles?.label,
            }}
            span={1}
            colon={colon}
            component={component[0]}
            itemPrefixCls={itemPrefixCls}
            bordered={bordered}
            label={label}
            type="label"
          />,
          <Cell
            key={`content-${key || index}`}
            class={className}
            style={{
              ...rootStyles?.content,
              ...style,
              ...styles?.content,
            }}
            span={span * 2 - 1}
            component={component[1]}
            itemPrefixCls={itemPrefixCls}
            bordered={bordered}
            content={children}
            type="content"
          />,
        ];
      },
    );
}

const descContext = useDescriptionsContextInject();
</script>
<template>
  <template v-if="vertical">
    <tr :key="`label-${index}`" :class="`${prefixCls}-row`">
      <Render :content="renderCells(row, $props, { component: 'th', type: 'label', showLabel: true, ...descContext })" />
    </tr>
    <tr :key="`content-${index}`" :class="`${prefixCls}-row`">
      <Render :content="renderCells(row, $props, { component: 'td', type: 'content', showContent: true, ...descContext })" />
    </tr>
  </template>
  <tr v-else :key="index" :class="`${prefixCls}-row`">
    <Render
      :content="
        renderCells(row, $props, {
          component: bordered ? ['th', 'td'] : 'td',
          type: 'item',
          showLabel: true,
          showContent: true,
          ...descContext,
        })
      "
    />
  </tr>
</template>
