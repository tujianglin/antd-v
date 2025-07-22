import { defineComponent, effect, ref } from 'vue';
import ResizeObserver from '..';
import type { ResizeObserverProps } from '../interface';

export default defineComponent({
  setup() {
    const times = ref(0);
    const disabled = ref(false);

    const onResize: ResizeObserverProps['onResize'] = () => {
      times.value = times.value + 1;
    };

    const resizeRef = ref();

    effect(() => {
      console.log(resizeRef.value);
    });
    return () => (
      <div style={{ transform: 'scale(1.1)', transformOrigin: '0% 0%' }}>
        <div>
          <label>
            <input
              type="checkbox"
              onChange={() => {
                disabled.value = !disabled.value;
              }}
              checked={disabled.value}
            />
            Disabled Observe
          </label>
          {' >>> '}
          <span>Resize times: {times.value}</span>
        </div>
        <ResizeObserver onResize={onResize} disabled={disabled.value}>
          {() => {
            return (
              <div style={{ display: 'inline-flex', flexDirection: 'column' }}>
                <textarea placeholder="I'm a textarea!" />
                <div ref={resizeRef} style={{ background: 'red', height: 50, fontSize: 10 }}>
                  Target
                </div>
              </div>
            );
          }}
        </ResizeObserver>
      </div>
    );
  },
});
