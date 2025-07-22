import { defineComponent, ref, type CSSProperties } from 'vue';
import ResizeObserver from '..';

function randomSize() {
  return {
    width: `${Math.round(50 + Math.random() * 150)}px`,
    height: `${Math.round(50 + Math.random() * 150)}px`,
  };
}

const sharedStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
};

export default defineComponent({
  setup() {
    const size1 = ref(randomSize());
    const size2 = ref(randomSize());
    return () => (
      <ResizeObserver.Collection
        onBatchResize={(infoList) => {
          console.log(
            'Batch Resize:',
            infoList,
            infoList.map(({ data, size }) => `${data}(${size.width}/${size.height})`),
          );
        }}
      >
        <div style={{ display: 'flex', columnGap: 4, marginBottom: 8 }}>
          <button onClick={() => (size1.value = randomSize())}>Resize: 1</button>
          <button onClick={() => (size2.value = randomSize())}>Resize: 2</button>
          <button
            onClick={() => {
              size1.value = randomSize();
              size2.value = randomSize();
            }}
          >
            Resize: all
          </button>
        </div>
        <div style={{ display: 'flex', columnGap: 16 }}>
          <ResizeObserver data="shape_1">
            <div style={{ ...sharedStyle, ...size1.value, background: 'red' }}>1</div>
          </ResizeObserver>
          <ResizeObserver data="shape_2">
            <div style={{ ...sharedStyle, ...size2.value, background: 'blue' }}>2</div>
          </ResizeObserver>
        </div>
      </ResizeObserver.Collection>
    );
  },
});
