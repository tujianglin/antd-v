<script lang="tsx">
import { Button, Card, Flex, Masonry, theme } from '@/components';
import { CloseOutlined } from '@ant-design/icons-vue';
import { defineComponent, ref } from 'vue';

const heights = [150, 50, 90, 70, 110, 150, 130, 80, 50, 90, 100, 150, 70, 50, 80];

type ItemType = {
  key: number;
  column?: number;
  data: number;
};

export default defineComponent({
  setup() {
    const { token } = theme.useToken();

    const items = ref<ItemType[]>(
      heights.map((height, index) => ({
        key: index,
        column: index % 4,
        data: height,
      })),
    );

    const removeItem = (removeKey) => {
      items.value = items.value.filter(({ key }) => key !== removeKey);
    };

    const addItem = () => {
      items.value = [
        ...items.value,
        {
          key: (items.value[items.value.length - 1]?.key || 0) + 1,
          data: Math.floor(Math.random() * 100) + 50,
        },
      ];
    };

    return () => (
      <Flex vertical gap={16}>
        <Masonry
          columns={4}
          gutter={16}
          items={items.value}
          itemRender={({ data, key }) => (
            <Card size="small" style={{ height: `${data}px` }}>
              {Number(key) + 1}
              <Button
                style={{
                  position: 'absolute',
                  insetBlockStart: `${token.value.paddingSM}px`,
                  insetInlineEnd: `${token.value.paddingSM}px`,
                }}
                size="small"
                icon={<CloseOutlined />}
                onClick={() => removeItem(key)}
              />
            </Card>
          )}
          onLayoutChange={(sortedItems) => {
            items.value = items.value.map((item) => {
              const matchItem = sortedItems.find((sortedItem) => sortedItem.key === item.key);
              return matchItem
                ? {
                    ...item,
                    column: matchItem.column,
                  }
                : item;
            });
          }}
        />
        <Button block onClick={addItem}>
          Add Item
        </Button>
      </Flex>
    );
  },
});
</script>
<style lang="less" scoped></style>
