import { defineComponent, onMounted, ref } from 'vue';
import ResizeObserver, { type ResizeObserverProps } from '..';

export default defineComponent({
  setup() {
    const times = ref(0);
    const disabled = ref(false);
    const textareaRef = ref<HTMLTextAreaElement>(null);

    onMounted(() => {
      console.log('Ref:', textareaRef.value);
    });

    const onResize: ResizeObserverProps['onResize'] = ({ width, height, offsetHeight, offsetWidth }) => {
      times.value = times.value + 1;
      console.log('Resize:', '\n', 'BoundingBox', width, height, '\n', 'Offset', offsetWidth, offsetHeight);
    };
    return () => (
      <div style={{ transform: 'scale(1.1)', transformOrigin: '0% 0%' }}>
        <div>
          <label>
            <input
              type="checkbox"
              onChange={() => {
                disabled.value = !disabled.value;
                console.log(disabled.value);
              }}
              checked={disabled.value}
            />
            Disabled Observe
          </label>
          {' >>> '}
          <span>Resize times: {times.value}</span>
        </div>
        <ResizeObserver onResize={onResize} disabled={disabled.value}>
          <textarea ref={textareaRef} placeholder="I'm a textarea!" />
        </ResizeObserver>
      </div>
    );
  },
});
