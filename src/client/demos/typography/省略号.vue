<script lang="tsx">
import { Switch, Typography } from '@/components';
import { defineComponent, ref } from 'vue';

const { Paragraph, Text } = Typography;

export default defineComponent({
  setup() {
    const ellipsis = ref(true);
    return () => (
      <>
        <Switch v-model:checked={ellipsis.value} />
        <br />

        <Paragraph ellipsis={ellipsis.value}>
          Ant Design, a design language for background applications, is refined by Ant UED Team. Ant Design, a design language for
          background applications, is refined by Ant UED Team. Ant Design, a design language for background applications, is
          refined by Ant UED Team. Ant Design, a design language for background applications, is refined by Ant UED Team. Ant
          Design, a design language for background applications, is refined by Ant UED Team. Ant Design, a design language for
          background applications, is refined by Ant UED Team.
        </Paragraph>

        <Paragraph ellipsis={ellipsis.value ? { rows: 2, expandable: true, symbol: 'more' } : false}>
          Ant Design, a design language for background applications, is refined by Ant UED Team. Ant Design, a design language for
          background applications, is refined by Ant UED Team. Ant Design, a design language for background applications, is
          refined by Ant UED Team. Ant Design, a design language for background applications, is refined by Ant UED Team. Ant
          Design, a design language for background applications, is refined by Ant UED Team. Ant Design, a design language for
          background applications, is refined by Ant UED Team.
        </Paragraph>

        <Text
          style={ellipsis.value ? { width: `${200}px` } : undefined}
          ellipsis={ellipsis.value ? { tooltip: 'I am ellipsis now!' } : false}
        >
          Ant Design, a design language for background applications, is refined by Ant UED Team.
        </Text>

        <Text
          code
          style={ellipsis.value ? { width: `${200}px` } : undefined}
          ellipsis={ellipsis.value ? { tooltip: 'I am ellipsis now!' } : false}
        >
          Ant Design, a design language for background applications, is refined by Ant UED Team.
        </Text>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
