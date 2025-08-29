import type { CSSMotionProps } from '@/vc-component/motion';
import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';
import type {
  BuiltinPlacements,
  MenuClickEventHandler,
  MenuMode,
  PopupRender,
  RenderIconType,
  TriggerSubMenuAction,
} from '../interface';
import type { SubMenuProps } from '../SubMenu/index.vue';

export interface MenuContextProps {
  prefixCls: string;
  classNames?: SubMenuProps['classNames'];
  styles?: SubMenuProps['styles'];
  rootClassName?: string;
  openKeys: string[];
  rtl?: boolean;

  // Mode
  mode: MenuMode;

  // Disabled
  disabled?: boolean;
  // Used for overflow only. Prevent hidden node trigger open
  overflowDisabled?: boolean;

  // Active
  activeKey: string;
  onActive: (key: string) => void;
  onInactive: (key: string) => void;

  // Selection
  selectedKeys: string[];

  // Level
  inlineIndent: number;

  // Motion
  motion?: CSSMotionProps;

  defaultMotions?: Partial<{ [key in MenuMode | 'other']: CSSMotionProps }>;

  // Popup
  subMenuOpenDelay: number;
  subMenuCloseDelay: number;
  forceSubMenuRender?: boolean;
  builtinPlacements?: BuiltinPlacements;
  triggerSubMenuAction?: TriggerSubMenuAction;

  popupRender?: PopupRender;

  // Icon
  itemIcon?: RenderIconType;
  expandIcon?: RenderIconType;

  // Function
  onItemClick: MenuClickEventHandler;
  onOpenChange: (key: string, open: boolean) => void;
  getPopupContainer: (node: HTMLElement) => HTMLElement;
}

function mergeProps(origin: MenuContextProps, target: Partial<MenuContextProps>): MenuContextProps {
  const clone = { ...origin };

  Object.keys(target).forEach((key) => {
    const value = target[key];
    if (value !== undefined) {
      clone[key] = value;
    }
  });

  return clone;
}

const MenuContext: InjectionKey<Reactive<MenuContextProps>> = Symbol('MenuContext');

export const useMenuContextInject = () => {
  return inject(MenuContext, reactive({} as MenuContextProps));
};

export const useMenuContextProvider = (props: Reactive<MenuContextProps>) => {
  provide(MenuContext, props);
};

export const MenuContextProvider = defineComponent({
  props: {
    value: Object as PropType<Partial<MenuContextProps & { locked?: boolean }>>,
  },
  setup(props, { slots }) {
    const context = useMenuContextInject();

    const inheritableContext = reactiveComputed(() => mergeProps(context, props.value));
    useMenuContextProvider(inheritableContext);
    return () => <>{slots?.default?.()}</>;
  },
});

export interface InheritableContextProps extends Partial<MenuContextProps> {
  locked?: boolean;
}
