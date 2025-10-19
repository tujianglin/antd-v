import findDOMNode from '@/vc-util/Dom/findDOMNode';
import raf from '@/vc-util/raf';
import { getCurrentInstance, shallowRef, toRefs, type ComputedRef } from 'vue';
import type { WaveProps } from '.';
import { useConfigContextInject } from '../../config-provider';
import useToken from '../../theme/useToken';
import { TARGET_CLS, type ShowWave, type WaveComponent } from './interface';
import showWaveEffect from './WaveEffect';

const useWave = (
  className: ComputedRef<string>,
  component?: WaveComponent,
  colorSource?: ComputedRef<WaveProps['colorSource']>,
) => {
  const instance = getCurrentInstance();
  const { wave } = toRefs(useConfigContextInject());
  const [, token, hashId] = useToken();

  const showWave: ShowWave = (event) => {
    const node = findDOMNode(instance);
    if (wave?.value?.disabled || !node) return;

    const targetNode = node.querySelector<HTMLElement>(`.${TARGET_CLS}`) || node;
    const { showEffect } = wave?.value || {};
    (showEffect || showWaveEffect)(targetNode, {
      className: className.value,
      token: token.value,
      component,
      event,
      hashId: hashId.value,
      colorSource: colorSource.value,
    });
  };

  const rafId = shallowRef<number>(null);

  const showDebounceWave: ShowWave = (event) => {
    raf.cancel(rafId.value!);

    rafId.value = raf(() => {
      showWave(event);
    });
  };

  return showDebounceWave;
};

export default useWave;
