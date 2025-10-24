import canUseDom from '@/vc-util/Dom/canUseDom';
import warning from '@/vc-util/warning';
import type { DrawerProps } from './Drawer.vue';

export function parseWidthHeight(value?: number | string) {
  if (typeof value === 'string') {
    const num = Number(value.replace(/px$/i, ''));

    if (!Number.isNaN(num)) {
      return num;
    }
  }
  return value;
}

export function warnCheck(props: DrawerProps) {
  warning(!('wrapperClassName' in props), `'wrapperClassName' is removed. Please use 'rootClassName' instead.`);

  warning(
    canUseDom() || !props.open,
    `Drawer with 'open' in SSR is not work since no place to createPortal. Please move to 'useEffect' instead.`,
  );
}
