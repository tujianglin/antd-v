import type { TriggerProps } from '@/vc-component/trigger';
import type { VueNode } from '@/vc-util/type';
import type { AriaAttributes, CSSProperties, HTMLAttributes } from 'vue';
import type { Gap } from './hooks/useTarget';
import type { PlacementType } from './placements';
import { type DefaultPanelProps } from './TourStep/DefaultPanel.vue';

export type SemanticName = 'section' | 'footer' | 'actions' | 'header' | 'title' | 'description' | 'mask';

export type HTMLAriaDataAttributes = /** @vue-ignore */ AriaAttributes & {
  [key: `data-${string}`]: unknown;
} & Pick<HTMLAttributes, 'role'>;

export interface TourStepInfo {
  arrow?: boolean | { pointAtCenter: boolean };
  target?: HTMLElement | (() => HTMLElement) | null | (() => null);
  title: VueNode;
  description?: VueNode;
  placement?: PlacementType;
  mask?:
    | boolean
    | {
        style?: CSSProperties;
        // to fill mask color, e.g. rgba(80,0,0,0.5)
        color?: string;
      };
  class?: string;
  style?: CSSProperties;
  scrollIntoViewOptions?: boolean | ScrollIntoViewOptions;
  closeIcon?: VueNode | boolean;
  closable?: boolean | ({ closeIcon?: VueNode | boolean } & HTMLAriaDataAttributes);
}

export interface TourStepProps extends TourStepInfo {
  prefixCls?: string;
  total?: number;
  current?: number;
  onClose?: () => void;
  onFinish?: () => void;
  renderPanel?: (step: any, current: number) => VueNode;
  onPrev?: () => void;
  onNext?: () => void;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
}

export interface TourProps extends Pick<TriggerProps, 'onPopupAlign'> {
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  class?: string;
  style?: CSSProperties;
  steps?: TourStepInfo[];
  onChange?: (current: number) => void;
  onClose?: (current: number) => void;
  onFinish?: () => void;
  closeIcon?: TourStepProps['closeIcon'] | boolean;
  closable?: TourStepProps['closable'];
  mask?:
    | boolean
    | {
        style?: CSSProperties;
        // to fill mask color, e.g. rgba(80,0,0,0.5)
        color?: string;
      };
  arrow?: boolean | { pointAtCenter: boolean };
  rootClassName?: string;
  placement?: PlacementType;
  prefixCls?: string;
  renderPanel?: (props: DefaultPanelProps, current: number) => VueNode;
  gap?: Gap;
  animated?: boolean | { placeholder: boolean };
  scrollIntoViewOptions?: boolean | ScrollIntoViewOptions;
  zIndex?: number;
  getPopupContainer?: any;
  builtinPlacements?:
    | TriggerProps['builtinPlacements']
    | ((config?: { arrowPointAtCenter?: boolean }) => TriggerProps['builtinPlacements']);
  disabledInteraction?: boolean;
}
