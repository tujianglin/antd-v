import { defineComponent, ref, watch, type CSSProperties } from 'vue';
import List from '../List.vue';
interface Item {
  id: string;
  height: number;
}

const Rect = ({ style }: { style?: CSSProperties }) => (
  <div
    style={{
      position: 'sticky',
      top: 0,
      background: 'blue',
      flex: 'none',
      borderInline: `1px solid red`,
      zIndex: 2,
      ...style,
    }}
  >
    Hello
  </div>
);
const MyItem = (props) => {
  const { id, height, style } = props;

  return (
    <div
      style={{
        border: '1px solid gray',
        height: `${height}px`,
        lineHeight: '30px',
        boxSizing: 'border-box',
        display: 'flex',
        // position: 'relative',
        alignItems: 'center',
        borderInline: 0,
        ...style,
      }}
    >
      <Rect
        style={{
          left: 0,
        }}
      />
      <div
        style={{
          flex: 'auto',
          minWidth: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {id} {'longText '.repeat(100)}
      </div>
      <Rect
        style={{
          right: 0,
        }}
      />
    </div>
  );
};

function getData(count: number) {
  const data: Item[] = [];
  for (let i = 0; i < count; i += 1) {
    data.push({
      id: `id_${i}`,
      height: Math.round(30 + Math.random() * 10),
    });
  }
  return data;
}

export default defineComponent({
  setup() {
    const rtl = ref(false);
    const count = ref('1000');
    const data = ref<Item[]>([]);

    watch(
      () => count.value,
      () => {
        const num = Number(count.value);
        if (!Number.isNaN(num)) {
          data.value = getData(num);
        }
      },
      { immediate: true },
    );
    return () => (
      <div>
        <button
          onClick={() => {
            rtl.value = !rtl.value;
          }}
        >
          RTL: {String(rtl.value)}
        </button>

        <input
          type="number"
          value={count.value}
          onChange={(e) => {
            const num = (e.target as HTMLInputElement).value;

            count.value = num;
          }}
        />

        <div style={{ width: '500px', margin: '64px' }}>
          <List
            fullHeight={false}
            direction={rtl.value ? 'rtl' : 'ltr'}
            data={data.value}
            height={300}
            itemHeight={30}
            itemKey="id"
            scrollWidth={2328}
            // scrollWidth={100}
            style={{
              border: '1px solid red',
              boxSizing: 'border-box',
            }}
            extraRender={(info) => {
              const { offsetY, rtl: isRTL } = info;
              const sizeInfo = info.getSize('id_5', 'id_10');
              return (
                <div
                  style={{
                    position: 'absolute',
                    top: `${-offsetY + sizeInfo.top}px`,
                    height: `${sizeInfo.bottom - sizeInfo.top}px`,
                    [isRTL ? 'right' : 'left']: `${100}px`,
                    background: 'rgba(255,0,0,0.9)',
                    zIndex: 1,
                  }}
                >
                  Extra
                </div>
              );
            }}
            onVirtualScroll={(e) => {
              console.warn('Scroll:', e);
            }}
          >
            {(item, _, props) => <MyItem {...item} {...props} />}
          </List>
        </div>
      </div>
    );
  },
});
