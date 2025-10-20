import canUseDom from '@/vc-util/Dom/canUseDom';
import { isStyleSupport } from '@/vc-util/Dom/styleChecker';

export const canUseDocElement = () => canUseDom() && window.document.documentElement;

export { isStyleSupport };
