import Render from '@/vc-component/render';
import { isVueNode } from '@/vc-util/Children/util';
import pickAttrs from '@/vc-util/pickAttrs';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { computed, type Ref } from 'vue';
import type { BreadcrumbProps, InternalRouteType, ItemType } from './Breadcrumb.vue';

type AddParameters<TFunction extends (...args: any) => any, TParameters extends [...args: any]> = (
  ...args: [...Parameters<TFunction>, ...TParameters]
) => ReturnType<TFunction>;

type ItemRender = NonNullable<BreadcrumbProps['itemRender']>;
type InternalItemRenderParams = AddParameters<ItemRender, [href?: string]>;

function getBreadcrumbName(route: InternalRouteType, params: any) {
  if (route.title === undefined || route.title === null) {
    return null;
  }
  const paramsKeys = Object.keys(params).join('|');
  return typeof route.title === 'string' || typeof route.title === 'number' ? (
    String(route.title).replace(new RegExp(`:(${paramsKeys})`, 'g'), (replacement, key) => params[key] || replacement)
  ) : (
    <Render content={route.title}></Render>
  );
}

export function renderItem(prefixCls: string, item: ItemType, children: VueNode, href?: string) {
  if (!isVueNode(children)) {
    return null;
  }

  const { class: className, onClick, ...restItem } = item;

  const passedProps = {
    ...pickAttrs(restItem, {
      data: true,
      aria: true,
    }),
    onClick,
  };

  if (href !== undefined) {
    return (
      <a {...passedProps} class={clsx(`${prefixCls}-link`, className)} href={href}>
        <Render content={children}></Render>
      </a>
    );
  }
  return (
    <span {...passedProps} class={clsx(`${prefixCls}-link`, className)}>
      <Render content={children}></Render>
    </span>
  );
}

export default function useItemRender(prefixCls: Ref<string>, itemRender?: Ref<ItemRender>) {
  return computed(() => {
    const mergedItemRender: InternalItemRenderParams = (item, params, routes, path, href) => {
      if (itemRender?.value) {
        return itemRender?.value(item, params, routes, path);
      }

      const name = getBreadcrumbName(item, params);

      return renderItem(prefixCls?.value, item, name, href);
    };

    return mergedItemRender;
  });
}
