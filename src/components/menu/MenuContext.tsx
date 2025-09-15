import type { VueNode } from '@/vc-util/type';
import { reactiveComputed } from '@vueuse/core';
import {
  defineComponent,
  inject,
  provide,
  reactive,
  type CSSProperties,
  type InjectionKey,
  type PropType,
  type Reactive,
} from 'vue';
import type { DirectionType } from '../config-provider';
import type { MenuProps, SemanticName, SubMenuName } from './InternalMenu.vue';

export type MenuTheme = 'light' | 'dark';

export interface MenuContextProps {
  prefixCls: string;
  inlineCollapsed: boolean;
  direction?: DirectionType;
  theme?: MenuTheme;
  firstLevel: boolean;
  /** @internal Safe to remove */
  disableMenuItemTitleTooltip?: boolean;
  classNames: Required<
    Record<SemanticName, string> & {
      popup: { root: string };
      subMenu: Required<Record<SubMenuName, string>>;
    }
  >;
  styles: Required<
    Record<SemanticName, CSSProperties> & {
      subMenu: Required<Record<SubMenuName, CSSProperties>>;
      popup: { root: CSSProperties };
    }
  >;
}

const MenuContext: InjectionKey<Reactive<MenuContextProps>> = Symbol('MenuContext');

export const useMenuContextInject = () => {
  return inject(
    MenuContext,
    reactive({
      prefixCls: '',
      firstLevel: true,
      inlineCollapsed: false,
      styles: null!,
      classNames: null!,
    } as MenuContextProps),
  );
};

export const useMenuContextProvider = (props: Reactive<MenuContextProps>) => {
  provide(MenuContext, props);
};

export const MenuContextProvider = defineComponent({
  props: {
    value: Object as PropType<MenuContextProps>,
  },
  setup(props, { slots }) {
    useMenuContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});

export interface OverrideContextProps {
  prefixCls?: string;
  expandIcon?: VueNode;
  mode?: MenuProps['mode'];
  selectable?: boolean;
  validator?: (menuProps: Pick<MenuProps, 'mode'>) => void;
  onClick?: () => void;
  rootClassName?: string;
}

const OverrideContext: InjectionKey<Reactive<OverrideContextProps>> = Symbol('OverrideContext');

export const useOverrideContextInject = () => {
  return inject(OverrideContext, reactive({} as OverrideContextProps));
};

export const useOverrideContextProvider = (props: Reactive<OverrideContextProps>) => {
  provide(OverrideContext, props);
};

export const OverrideContextProvider = defineComponent({
  props: {
    value: Object as PropType<OverrideContextProps>,
  },
  setup(props, { slots }) {
    useOverrideContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});
