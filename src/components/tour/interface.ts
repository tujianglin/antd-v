import type { TourProps as RCTourProps, TourStepProps as RCTourStepProps } from '@/vc-component/tour';
import type { VueNode } from '@/vc-util/type';
import type { CSSProperties } from 'vue';
import type { SemanticClassNames, SemanticClassNamesType, SemanticStyles, SemanticStylesType } from '../_util/hooks';

export interface TourProps extends Omit<RCTourProps, 'renderPanel' | 'classNames' | 'styles'> {
  steps?: TourStepProps[];
  prefixCls?: string;
  indicatorsRender?: (current: number, total: number) => VueNode;
  actionsRender?: TourStepProps['actionsRender'];
  type?: 'default' | 'primary'; //	default type, affects the background color and text color
  classNames?: TourClassNamesType;
  styles?: TourStylesType;
  class?: string;
  style?: CSSProperties;
}

export type TourSemanticName =
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

export type TourClassNamesType = SemanticClassNamesType<TourProps, TourSemanticName>;
export type TourStylesType = SemanticStylesType<TourProps, TourSemanticName>;
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
  classNames?: SemanticClassNames<TourSemanticName>;
  styles?: SemanticStyles<TourSemanticName>;
}

export interface TourLocale {
  Next: string;
  Previous: string;
  Finish: string;
}
