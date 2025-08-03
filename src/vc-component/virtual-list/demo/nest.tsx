import { defineComponent } from 'vue';
import List from '../List.vue';
import './basic.less';

interface Item {
  id: number;
}

const data: Item[] = [];
for (let i = 0; i < 100; i += 1) {
  data.push({
    id: i,
  });
}

const MyItem = ({ id }) => (
  <div style={{ padding: '20px', background: 'yellow' }}>
    <List
      data={data}
      height={200}
      itemHeight={20}
      itemKey="id"
      style={{
        border: '1px solid blue',
        boxSizing: 'border-box',
        background: 'white',
      }}
      // debug={`inner_${id}`}
    >
      {(item, index, props) => (
        <div {...(item as any)} {...props} style={{ height: '20px', border: '1px solid cyan' }}>
          {id}-{index}
        </div>
      )}
    </List>
  </div>
);

const onScroll = (e) => {
  console.log('scroll:', e.currentTarget.scrollTop);
};

export default defineComponent({
  setup() {
    return () => (
      <List
        id="list"
        data={data}
        height={800}
        itemHeight={20}
        itemKey="id"
        style={{
          border: '1px solid red',
          boxSizing: 'border-box',
        }}
        onScroll={onScroll}
        // debug="outer"
      >
        {(item, _, props) => <MyItem {...item} {...props} />}
      </List>
    );
  },
});
