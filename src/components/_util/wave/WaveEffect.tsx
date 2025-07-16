import raf from '@/vc-component/util/lib/raf';
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  render,
  Transition,
  useTemplateRef,
  type CSSProperties,
  type PropType,
} from 'vue';
import type { WaveProps } from '.';
import type { ShowWaveEffect } from './interface';
import { getTargetWaveColor } from './util';

function validateNum(value: number) {
  return Number.isNaN(value) ? 0 : value;
}

const WaveEffect = defineComponent({
  props: {
    className: String,
    target: {
      type: Object as PropType<HTMLElement>,
    },
    component: String,
    colorSource: {
      type: Object as PropType<WaveProps['colorSource']>,
    },
  },
  setup(props) {
    const divRef = useTemplateRef<HTMLDivElement>('divRef');
    const color = ref(null);
    const borderRadius = ref<number[]>([]);
    const left = ref(0);
    const top = ref(0);
    const width = ref(0);
    const height = ref(0);
    const enabled = ref(false);

    const waveStyle = computed(
      (): CSSProperties => ({
        left: left.value,
        top: top.value,
        width: width.value,
        height: height.value,
        borderRadius: borderRadius.value.map((radius) => `${radius}px`).join(' '),
        ...(color.value ? { '--wave-color': color.value } : {}),
      }),
    );

    function syncPos() {
      const { target } = props;
      const nodeStyle = getComputedStyle(target);

      // Get wave color from target
      color.value = getTargetWaveColor(target, props.colorSource);

      const isStatic = nodeStyle.position === 'static';

      // Rect
      const { borderLeftWidth, borderTopWidth } = nodeStyle;
      left.value = isStatic ? target.offsetLeft : validateNum(-parseFloat(borderLeftWidth));
      top.value = isStatic ? target.offsetTop : validateNum(-parseFloat(borderTopWidth));
      width.value = target.offsetWidth;
      height.value = target.offsetHeight;

      // Get border radius
      const { borderTopLeftRadius, borderTopRightRadius, borderBottomLeftRadius, borderBottomRightRadius } = nodeStyle;
      borderRadius.value = [borderTopLeftRadius, borderTopRightRadius, borderBottomRightRadius, borderBottomLeftRadius].map(
        (radius) => validateNum(parseFloat(radius)),
      );
    }

    // Add resize observer to follow size
    let resizeObserver: ResizeObserver;
    let rafId: number;
    let timeoutId: any;
    const clear = () => {
      clearTimeout(timeoutId);
      raf.cancel(rafId);
      resizeObserver?.disconnect();
    };

    const removeDom = () => {
      const holder = divRef.value?.parentElement;
      if (holder) {
        render(null, holder);
        if (holder.parentElement) {
          holder.parentElement.removeChild(holder);
        }
      }
    };

    onMounted(() => {
      clear();
      timeoutId = setTimeout(() => {
        removeDom();
      }, 5000);
      if (props.target) {
        // We need delay to check position here
        // since UI may change after click
        rafId = raf(() => {
          syncPos();
          enabled.value = true;
        });

        // Add resize observer to follow size
        if (typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(syncPos);

          resizeObserver.observe(props.target);
        }
      }
    });

    onBeforeUnmount(() => {
      clear();
    });

    const onTransitionend = (e: TransitionEvent) => {
      if (e.propertyName === 'opacity') {
        removeDom();
      }
    };
    return (
      <Transition
        appear
        name="wave-motion"
        appearFromClass="wave-motion-appear"
        appearActiveClass="wave-motion-appear"
        appearToClass="wave-motion-appear wave-motion-appear-active"
      >
        <div ref={divRef} class={props.className} style={waveStyle.value} onTransitionend={onTransitionend} />
      </Transition>
    );
  },
});

const showWaveEffect: ShowWaveEffect = (target, info) => {
  const { component } = info;

  // Skip for unchecked checkbox
  if (component === 'Checkbox' && !target.querySelector<HTMLInputElement>('input')?.checked) {
    return;
  }

  // Create holder
  const holder = document.createElement('div');
  holder.style.position = 'absolute';
  holder.style.left = '0px';
  holder.style.top = '0px';
  target?.insertBefore(holder, target?.firstChild);

  render(<WaveEffect {...info} target={target} />, holder);
  return () => {
    render(null, holder);
    if (holder.parentElement) {
      holder.parentElement.removeChild(holder);
    }
  };
};

export default showWaveEffect;
