<script lang="tsx">
import { Card, Masonry } from '@/components';
import { defineComponent } from 'vue';

const heights = [120, 55, 85, 160, 95, 140, 75, 110, 65, 130, 90, 145, 55, 100, 80];

const items = heights.map((height, index) => ({
  key: `item-${index}`,
  data: height,
  index,
}));

export default defineComponent({
  setup() {
    return () => (
      <Masonry
        columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
        gutter={{ xs: 8, sm: 12, md: 16 }}
        items={items}
        itemRender={(item) => (
          <Card size="small" style={{ height: `${item.data}px` }}>
            {item.index + 1}
          </Card>
        )}
      />
    );
  },
});
</script>
<style lang="less" scoped></style>
