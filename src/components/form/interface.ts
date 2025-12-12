import type { FormInstance as RcFormInstance } from '@/vc-component/form/interface';
import type { Options } from 'scroll-into-view-if-needed';
export type { InternalNamePath, NamePath, Rule, RuleObject, RuleRender, Store, StoreValue } from '@/vc-component/form/interface';

export type ScrollFocusOptions = Options & {
  focus?: boolean;
};
export type ScrollOptions = ScrollFocusOptions; // alias
export type FormLabelAlign = 'left' | 'right';

export type FormInstance = RcFormInstance;
