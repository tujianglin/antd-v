import type { VueKey, VueNode } from '@/vc-util/type';
import { reactiveComputed } from '@vueuse/core';
import {
  computed,
  defineComponent,
  inject,
  provide,
  reactive,
  ref,
  type CSSProperties,
  type InjectionKey,
  type PropType,
  type Reactive,
  type Ref,
} from 'vue';
import type { ValidateStatus } from '../_util/statusUtils.ts';
import type { Variant } from '../config-provider';
import type { ColProps } from '../grid/col.vue';
import type { FormLayout, RequiredMark, SemanticName } from './Form.vue';
import type { FormLabelAlign } from './interface';

/** Form Context. Set top form style and pass to Form Item usage. */
export interface FormContextProps {
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  layout: FormLayout;
  name?: string;
  colon?: boolean;
  labelAlign?: FormLabelAlign;
  labelWrap?: boolean;
  labelCol?: ColProps;
  wrapperCol?: ColProps;
  requiredMark?: RequiredMark;
  itemRef: (name: (string | number)[]) => (node: VueNode) => void;
}

const FormContext: InjectionKey<Reactive<FormContextProps>> = Symbol('FormContext');

export const useFormContextInject = () => {
  return inject(
    FormContext,
    reactive<Partial<FormContextProps>>({
      labelAlign: 'right',
      layout: 'horizontal',
      itemRef: (() => {}) as any,
    }),
  );
};

export const useFormContextProvider = (props: Reactive<FormContextProps>) => {
  provide(FormContext, props);
};

export const FormContextProvider = defineComponent({
  props: {
    value: Object as PropType<FormContextProps>,
  },
  setup(props, { slots }) {
    useFormContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});

/** `noStyle` Form Item Context. Used for error collection */
export type ReportMetaChange = (meta: any, uniqueKeys: VueKey[]) => void;

const NoStyleItemContext: InjectionKey<Ref<ReportMetaChange>> = Symbol('NoStyleItemContext');

export const useNoStyleItemContextInject = () => {
  return inject(NoStyleItemContext, ref<ReportMetaChange>(null));
};

export const useNoStyleItemContextProvider = (props: Ref<ReportMetaChange>) => {
  provide(NoStyleItemContext, props);
};

export const NoStyleItemContextProvider = defineComponent({
  props: {
    value: [Function] as PropType<ReportMetaChange>,
  },
  setup(props, { slots }) {
    useNoStyleItemContextProvider(computed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});

/** Form Provider */
export interface FormProviderProps {
  prefixCls?: string;
}

/** Used for ErrorList only */
export interface FormItemPrefixContextProps {
  prefixCls: string;
  status?: ValidateStatus;
}

const FormItemPrefixContext: InjectionKey<Reactive<FormItemPrefixContextProps>> = Symbol('FormItemPrefixContext');

export const useFormItemPrefixContextInject = () => {
  return inject(
    FormItemPrefixContext,
    reactive<FormItemPrefixContextProps>({
      prefixCls: '',
    }),
  );
};

export const useFormItemPrefixContextProvider = (props: Reactive<FormItemPrefixContextProps>) => {
  provide(FormItemPrefixContext, props);
};

export const FormItemPrefixContextProvider = defineComponent({
  props: {
    value: Object as PropType<FormItemPrefixContextProps>,
  },
  setup(props, { slots }) {
    useFormItemPrefixContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});

export interface FormItemStatusContextProps {
  isFormItemInput?: boolean;
  status?: ValidateStatus;
  errors?: VueNode[];
  warnings?: VueNode[];
  hasFeedback?: boolean;
  feedbackIcon?: VueNode;
  name?: any;
}

const FormItemInputContext: InjectionKey<Reactive<FormItemStatusContextProps>> = Symbol('FormItemInputContext');

export const useFormItemInputContextInject = () => {
  return inject(FormItemInputContext, reactive<FormItemStatusContextProps>({}));
};

export const useFormItemInputContextProvider = (props: Reactive<FormItemStatusContextProps>) => {
  provide(FormItemInputContext, props);
};

export const FormItemInputContextProvider = defineComponent({
  props: {
    value: Object as PropType<FormItemStatusContextProps>,
  },
  setup(props, { slots }) {
    useFormItemInputContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});

export type NoFormStyleProps = {
  status?: boolean;
  override?: boolean;
};

export const NoFormStyle = defineComponent({
  inheritAttrs: false,
  props: ['status', 'override'],
  setup(props, { slots }) {
    const formItemInputContext = useFormItemInputContextInject();

    const newFormItemInputContext = computed(() => {
      const newContext = { ...formItemInputContext };
      if (props.override) {
        delete newContext.isFormItemInput;
      }
      if (props.status) {
        delete newContext.status;
        delete newContext.hasFeedback;
        delete newContext.feedbackIcon;
      }
      return newContext;
    });

    return () => (
      <FormItemInputContextProvider value={newFormItemInputContext.value}>{slots?.default?.()}</FormItemInputContextProvider>
    );
  },
});

const VariantContext: InjectionKey<Ref<Variant | undefined>> = Symbol('VariantContext');

export const useVariantContextInject = () => {
  return inject(VariantContext, ref<Variant | undefined>(undefined));
};

export const useVariantContextProvider = (props: Ref<Variant | undefined>) => {
  provide(VariantContext, props);
};

export const VariantContextProvider = defineComponent({
  props: {
    value: [String, undefined] as PropType<Variant | undefined>,
  },
  setup(props, { slots }) {
    useVariantContextProvider(computed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});
