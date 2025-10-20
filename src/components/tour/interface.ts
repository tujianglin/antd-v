import type { TourProps as RCTourProps, TourStepProps as RCTourStepProps } from '@/vc-component/tour';
import type { VueNode } from '@/vc-util/type';
import type { CSSProperties } from 'vue';

export interface TourProps extends Omit<RCTourProps, 'renderPanel'> {
  steps?: TourStepProps[];
  prefixCls?: string;
  indicatorsRender?: (current: number, total: number) => VueNode;
  actionsRender?: TourStepProps['actionsRender'];
  type?: 'default' | 'primary'; //	default type, affects the background color and text color
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  class?: string;
  style?: CSSProperties;
}

export type SemanticName =
  | 'root'
  | 'cover'
  | 'mask'
  | 'section'
  | 'footer'
  | 'actions'
  | 'indicator'
  | 'indicators'
  | 'header'
  | 'title'
  | 'description';

export interface TourStepProps extends RCTourStepProps {
  cover?: VueNode; // Display pictures or videos
  nextButtonProps?: {
    children?: VueNode;
    onClick?: () => void;
    className?: string;
    style?: CSSProperties;
  };
  prevButtonProps?: {
    children?: VueNode;
    onClick?: () => void;
    className?: string;
    style?: CSSProperties;
  };
  indicatorsRender?: (current: number, total: number) => VueNode;
  actionsRender?: (originNode: VueNode, info: { current: number; total: number }) => VueNode;
  type?: 'default' | 'primary'; //	default type, affects the background color and text color
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
}

export interface TourLocale {
  Next: string;
  Previous: string;
  Finish: string;
}
