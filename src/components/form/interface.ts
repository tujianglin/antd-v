import type { FormInstance as RcFormInstance } from '@/vc-component/form/interface';
import type { Options } from 'scroll-into-view-if-needed';
import type { CSSProperties } from 'vue';
import type { ErrorListProps as ErrorListPropsInternal } from './ErrorList.vue';
import type { FormItemProps as FormItemPropsInternal } from './FormItem';
import type { FormListProps as FormListPropsInternal } from './FormList.vue';
export type { InternalNamePath, NamePath, Rule, RuleObject, RuleRender, Store, StoreValue } from '@/vc-component/form/interface';

export type ScrollFocusOptions = Options & {
  focus?: boolean;
};
export type ScrollOptions = ScrollFocusOptions; // alias
export type FormLabelAlign = 'left' | 'right';

export type FormInstance = RcFormInstance;

export interface FormProps {
  layout?: 'horizontal' | 'vertical' | 'inline';
  labelCol?: any;
  wrapperCol?: any;
  form?: FormInstance;
  initialValues?: any;
  onFinish?: (values: any) => void;
  onFinishFailed?: (errorInfo: any) => void;
  onFieldsChange?: (changedFields: any[], allFields: any[]) => void;
  onValuesChange?: (changedValues: any, allValues: any) => void;
  validateMessages?: any;
  validateTrigger?: string | string[];
  style?: CSSProperties;
  class?: string;
  prefixCls?: string;
  name?: string;
  colon?: boolean;
  labelAlign?: FormLabelAlign;
  labelWrap?: boolean;
  requiredMark?: boolean | 'optional';
  scrollToFirstError?: boolean | ScrollFocusOptions;
  disabled?: boolean;
  component?: any;
  fields?: any[];
  preserve?: boolean;
  size?: 'small' | 'middle' | 'large';
}

export type FormItemProps = FormItemPropsInternal;
export type FormListProps = FormListPropsInternal;
export type ErrorListProps = ErrorListPropsInternal;
