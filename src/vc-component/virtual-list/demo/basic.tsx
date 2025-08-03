import { defineComponent, ref } from 'vue';
import List from '../List.vue';
import './basic.less';

interface Item {
  id: number;
}

const MyItem = ({ id }) => (
  <span
    style={{
      height: `${30 + (id % 2 ? 0 : 10)}px`,
    }}
    class="fixed-item"
    onClick={() => {
      console.log('Click:', id);
    }}
  >
    {id}
  </span>
);

const TestItem = ({ id }) => {
  return <div style={{ lineHeight: '30px' }}>{id}</div>;
};

const data: Item[] = [];
for (let i = 0; i < 1000; i += 1) {
  data.push({
    id: i,
  });
}

const TYPES = [
  { name: 'ref real dom element', type: 'dom', component: MyItem },
  { name: 'ref react node', type: 'react', component: TestItem },
];

const onScroll = (e: UIEvent) => {
  console.log('scroll:', (e.currentTarget as HTMLDivElement).scrollTop);
};

export default defineComponent({
  setup() {
    const destroy = ref(false);
    const visible = ref(true);
    const type = ref('dom');
    const listRef = ref(null);

    const virtual = ref(true);

    setTimeout(() => {
      // virtual.value = false;
    }, 2000);
    return () => (
      <div style={{ height: '200vh' }}>
        <h2>Basic</h2>
        {TYPES.map(({ name, type: nType }) => (
          <label key={nType}>
            <input
              name="type"
              type="radio"
              checked={type.value === nType}
              onChange={() => {
                type.value = nType;
              }}
            />
            {name}
          </label>
        ))}
        <button
          type="button"
          onClick={() => {
            listRef.value?.scrollTo(null);
          }}
        >
          Show scroll bar
        </button>
        <button
          type="button"
          onClick={() => {
            listRef.value?.scrollTo(500);
          }}
        >
          Scroll To 100px
        </button>
        <button
          type="button"
          onClick={() => {
            listRef.value?.scrollTo({
              index: 99999999,
              align: 'top',
            });
          }}
        >
          Scroll To 99999999 (top)
        </button>
        <button
          type="button"
          onClick={() => {
            listRef.value?.scrollTo({
              index: 50,
              align: 'top',
            });
          }}
        >
          Scroll To 50 (top)
        </button>
        <button
          type="button"
          onClick={() => {
            listRef.value?.scrollTo({
              index: 50,
              align: 'bottom',
            });
          }}
        >
          Scroll To 50 (bottom)
        </button>
        <button
          type="button"
          onClick={() => {
            listRef.value?.scrollTo({
              index: 50,
              align: 'auto',
            });
          }}
        >
          Scroll To 50 (auto)
        </button>
        <button
          type="button"
          onClick={() => {
            listRef.value?.scrollTo({
              index: 50,
              align: 'top',
              offset: 15,
            });
          }}
        >
          Scroll To 50 (top) + 15 offset
        </button>
        <button
          type="button"
          onClick={() => {
            listRef.value?.scrollTo({
              index: 50,
              align: 'bottom',
              offset: 15,
            });
          }}
        >
          Scroll To 50 (bottom) + 15 offset
        </button>
        <button
          type="button"
          onClick={() => {
            listRef.value?.scrollTo({
              key: 50,
              align: 'auto',
            });
          }}
        >
          Scroll To key 50 (auto)
        </button>
        <button
          type="button"
          onClick={() => {
            visible.value = !visible.value;
          }}
        >
          visible
        </button>
        <button
          type="button"
          onClick={() => {
            listRef.value?.scrollTo({
              index: data.length - 2,
              align: 'top',
            });
          }}
        >
          Scroll To Last (top)
        </button>
        <button
          type="button"
          onClick={() => {
            listRef.value?.scrollTo({
              index: 0,
              align: 'bottom',
            });
          }}
        >
          Scroll To First (bottom)
        </button>
        <button
          type="button"
          onClick={() => {
            listRef.value?.scrollTo({
              index: 50,
              align: 'top',
            });
            destroy.value = true;
          }}
        >
          Scroll To remove
        </button>
        {!destroy.value ? (
          <List
            id="list"
            ref={listRef}
            data={data}
            height={200}
            itemHeight={20}
            itemKey="id"
            virtual={virtual.value}
            style={{
              border: '1px solid red',
              boxSizing: 'border-box',
              display: visible.value ? null : 'none',
            }}
            onScroll={onScroll}
          >
            {(item, _, props) => {
              return type.value === 'dom' ? <MyItem {...item} {...props} /> : <TestItem {...item} {...props} />;
            }}
          </List>
        ) : (
          ''
        )}
      </div>
    );
  },
});
