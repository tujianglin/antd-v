<script lang="tsx">
import { Flex, Slider, Switch, Typography } from '@/components';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  setup() {
    const expanded = ref(false);
    const rows = ref();
    return () => (
      <>
        <Flex gap={16} vertical>
          <Flex gap={16} align="center">
            <Switch v-model:checked={expanded.value} style={{ flex: 'none' }} />
            <Slider min={1} max={20} v-model:value={rows.value} style={{ flex: 'auto' }} />
          </Flex>

          <Typography.Paragraph
            ellipsis={{
              rows: rows.value,
              expandable: 'collapsible',
              expanded: expanded.value,
              onExpand: (_, info) => (expanded.value = info.expanded),
            }}
            copyable
          >
            {'Ant Design, a design language for background applications, is refined by Ant UED Team.'.repeat(20)}
          </Typography.Paragraph>
        </Flex>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
