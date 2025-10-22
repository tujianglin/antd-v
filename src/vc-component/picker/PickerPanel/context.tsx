import type { DateType } from '@/vc-util/type';
import { reactiveComputed, type ReactiveComputedReturn } from '@vueuse/core';
import {
  computed,
  defineComponent,
  inject,
  provide,
  reactive,
  toRefs,
  type ComputedRef,
  type InjectionKey,
  type PropType,
  type Reactive,
} from 'vue';
import type { FilledPanelClassNames, FilledPanelStyles } from '../hooks/useSemantic';
import type { PanelMode, SharedPanelProps } from '../interface';

export interface SharedPanelContextProps {
  classNames: FilledPanelClassNames;
  styles: FilledPanelStyles;
}

const SharedPanelContext: InjectionKey<Reactive<SharedPanelContextProps>> = Symbol('SharedPanelContext');

export const useSharedPanelContextInject = () => {
  return inject(SharedPanelContext, reactive<Partial<SharedPanelContextProps>>({}));
};

export const useSharedPanelContextProvider = (props: Reactive<SharedPanelContextProps>) => {
  provide(SharedPanelContext, props);
};

export const SharedPanelContextProvider = defineComponent({
  props: {
    value: Object as PropType<SharedPanelContextProps>,
  },
  setup(props, { slots }) {
    useSharedPanelContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});

export interface PanelContextProps
  extends Pick<
    SharedPanelProps,
    | 'prefixCls'
    | 'cellRender'
    | 'generateConfig'
    | 'locale'
    | 'onSelect'
    | 'hoverValue'
    | 'hoverRangeValue'
    | 'onHover'
    | 'values'
    | 'pickerValue'

    // Limitation
    | 'disabledDate'
    | 'minDate'
    | 'maxDate'

    // Icon
    | 'prevIcon'
    | 'nextIcon'
    | 'superPrevIcon'
    | 'superNextIcon'
  > {
  /** Tell current panel type */
  panelType: PanelMode;

  // Shared
  now: DateType;

  classNames: FilledPanelClassNames;
  styles: FilledPanelStyles;
}

/** Used for each single Panel. e.g. DatePanel */
const PanelContext: InjectionKey<Reactive<PanelContextProps>> = Symbol('PanelContext');

export const usePanelContextInject = (): Reactive<Partial<PanelContextProps>> => {
  return inject(PanelContext, reactive<Partial<PanelContextProps>>({}));
};

export const usePanelContextProvider = (props: Reactive<PanelContextProps>) => {
  provide(PanelContext, props);
};

export const PanelContextProvider = defineComponent({
  props: {
    value: Object as PropType<PanelContextProps>,
  },
  setup(props, { slots }) {
    usePanelContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});

/**
 * Get shared props for the SharedPanelProps interface.
 */
export function useInfo(
  props: ReactiveComputedReturn<SharedPanelProps>,
  panelType: ComputedRef<PanelMode>,
): [info: ComputedRef<PanelContextProps>, now: ComputedRef] {
  // TODO: this is not good to get from each props.
  // Should move to `SharedPanelContext` instead.

  // ======================= Context ========================
  const { classNames, styles } = toRefs(useSharedPanelContextInject());

  // ========================= MISC =========================
  const now = computed(() => props.generateConfig.getNow());

  // ========================= Info =========================
  const info = computed(
    () =>
      ({
        now: now.value,
        values: props.values,
        pickerValue: props.pickerValue,
        prefixCls: props.prefixCls,
        classNames: classNames.value,
        styles: styles.value,
        disabledDate: props.disabledDate,
        minDate: props.minDate,
        maxDate: props.maxDate,
        cellRender: props.cellRender,
        hoverValue: props.hoverValue,
        hoverRangeValue: props.hoverRangeValue,
        onHover: props.onHover,
        locale: props.locale,
        generateConfig: props.generateConfig,
        onSelect: props.onSelect,
        panelType: panelType.value,

        // Icons
        prevIcon: props.prevIcon,
        nextIcon: props.nextIcon,
        superPrevIcon: props.superPrevIcon,
        superNextIcon: props.superNextIcon,
      }) as PanelContextProps,
  );

  return [info, now];
}

// ============================== Internal ==============================
export interface PickerHackContextProps {
  hidePrev?: boolean;
  hideNext?: boolean;
  hideHeader?: boolean;
  onCellDblClick?: () => void;
}

/**
 * Internal usage for RangePicker to not to show the operation arrow
 */

const PickerHackContext: InjectionKey<Reactive<PickerHackContextProps>> = Symbol('PickerHackContext');

export const usePickerHackContextInject = () => {
  return inject(PickerHackContext, reactive<Partial<PickerHackContextProps>>({}));
};

export const usePickerHackContextProvider = (props: Reactive<PickerHackContextProps>) => {
  provide(PickerHackContext, props);
};

export const PickerHackContextProvider = defineComponent({
  props: {
    value: Object as PropType<PickerHackContextProps>,
  },
  setup(props, { slots }) {
    usePickerHackContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});
