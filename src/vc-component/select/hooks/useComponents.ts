import { reactiveComputed, type ReactiveComputedReturn } from '@vueuse/core';
import type { ComputedRef } from 'vue';
import type { BaseSelectProps } from '../BaseSelect/interface';

export interface ComponentsConfig {
  root?: any;
  input?: any;
}

export interface FilledComponentsConfig {
  root: any;
  input: any;
}

export default function useComponents(
  components?: ComputedRef<ComponentsConfig>,
  getInputElement?: BaseSelectProps['getInputElement'],
  getRawInputElement?: BaseSelectProps['getRawInputElement'],
): ReactiveComputedReturn<ComponentsConfig> {
  return reactiveComputed(() => {
    let { root, input } = components.value || {};

    // root: getRawInputElement
    if (getRawInputElement) {
      root = getRawInputElement();
    }

    // input: getInputElement
    if (getInputElement) {
      input = getInputElement();
    }

    return {
      root,
      input,
    };
  });
}
