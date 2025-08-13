import type { UnmountType } from '@/components/config-provider/UnstableContext';
import CSSMotion from '@/vc-component/motion';
import raf from '@/vc-util/raf';
import { composeRef } from '@/vc-util/ref';
import clsx from 'clsx';
import { defineComponent, onBeforeUnmount, onMounted, ref, render, shallowRef, type CSSProperties, type PropType } from 'vue';
import type { WaveProps } from '.';
import useState from '../hooks/useState';
import type { ShowWaveEffect } from './interface';
import { getTargetWaveColor } from './util';

function validateNum(value: number) {
  return Number.isNaN(value) ? 0 : value;
}

const WaveEffect = defineComponent({
  inheritAttrs: false,
  props: {
    className: String,
    target: {
      type: Object as PropType<HTMLElement>,
    },
    component: String,
    registerUnmount: Function as PropType<() => UnmountType | null>,
    colorSource: {
      type: Object as PropType<WaveProps['colorSource']>,
    },
  },
  setup(props) {
    const divRef = shallowRef<HTMLDivElement>(null);
    const unmountRef = ref<UnmountType>(null);
    const [color, setWaveColor] = useState<string | null>(null);
    const [borderRadius, setBorderRadius] = useState<number[]>([]);
    const [left, setLeft] = useState(0);
    const [top, setTop] = useState(0);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [enabled, setEnabled] = useState(false);

    onMounted(() => {
      unmountRef.value = props?.registerUnmount?.();
    });

    function syncPos() {
      const { target } = props;
      const nodeStyle = getComputedStyle(target);

      // Get wave color from target
      setWaveColor(getTargetWaveColor(target));

      const isStatic = nodeStyle.position === 'static';

      // Rect
      const { borderLeftWidth, borderTopWidth } = nodeStyle;
      setLeft(isStatic ? target.offsetLeft : validateNum(-parseFloat(borderLeftWidth)));
      setTop(isStatic ? target.offsetTop : validateNum(-parseFloat(borderTopWidth)));
      setWidth(target.offsetWidth);
      setHeight(target.offsetHeight);

      // Get border radius
      const { borderTopLeftRadius, borderTopRightRadius, borderBottomLeftRadius, borderBottomRightRadius } = nodeStyle;

      setBorderRadius(
        [borderTopLeftRadius, borderTopRightRadius, borderBottomRightRadius, borderBottomLeftRadius].map((radius) =>
          validateNum(parseFloat(radius)),
        ),
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
          setEnabled(true);
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
    return () => {
      if (!enabled.value) {
        return null;
      }
      const waveStyle = {
        left: `${left.value}px`,
        top: `${top.value}px`,
        width: `${width.value}px`,
        height: `${height.value}px`,
        borderRadius: borderRadius.value.map((radius) => `${radius}px`).join(' '),
      } as CSSProperties & {
        [name: string]: number | string;
      };

      if (color) {
        waveStyle['--wave-color'] = color.value as string;
      }
      return (
        <CSSMotion
          visible
          motionAppear
          motionName="wave-motion"
          motionDeadline={5000}
          onAppearEnd={(_, event) => {
            if (event.deadline || (event as TransitionEvent).propertyName === 'opacity') {
              const holder = divRef.value?.parentElement;
              unmountRef.value?.().then(() => {
                holder?.remove();
              });
            }
            return false;
          }}
        >
          {{
            default: ({ class: motionClassName, ref: motionRef }) => (
              <div
                ref={composeRef((e) => (divRef.value = e), motionRef)}
                class={clsx(props.className, motionClassName)}
                style={waveStyle}
                onTransitionend={onTransitionend}
              />
            ),
          }}
        </CSSMotion>
      );
    };
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

  let unmountCallback: UnmountType | null = null;

  function registerUnmount() {
    return unmountCallback;
  }

  unmountCallback = render(<WaveEffect {...info} target={target} registerUnmount={registerUnmount}></WaveEffect>, holder) as any;
};

export default showWaveEffect;
