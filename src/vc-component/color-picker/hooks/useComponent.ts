import { computed, type Ref } from 'vue';
import Slider from '../components/Slider.vue';

export interface Components {
  slider?: any;
}

type RequiredComponents = Required<Components>;

export default function useComponent(components?: Ref<Components>): Ref<RequiredComponents['slider']> {
  return computed(() => {
    const { slider } = components.value || {};

    return slider || Slider;
  });
}
