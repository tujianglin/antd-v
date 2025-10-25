<script lang="tsx">
import { Typography } from '@/components';
import { SmileFilled, SmileOutlined } from '@ant-design/icons-vue';
import { defineComponent } from 'vue';

const { Paragraph, Text } = Typography;

export default defineComponent({
  setup() {
    return () => (
      <>
        <Paragraph copyable>This is a copyable text.</Paragraph>
        <Paragraph copyable={{ text: 'Hello, Ant Design!' }}>Replace copy text.</Paragraph>
        <Paragraph
          copyable={{
            icon: [<SmileOutlined key="copy-icon" />, <SmileFilled key="copied-icon" />],
            tooltips: ['click here', 'you clicked!!'],
          }}
        >
          Custom Copy icon and replace tooltips text.
        </Paragraph>
        <Paragraph copyable={{ tooltips: false }}>Hide Copy tooltips.</Paragraph>
        <Paragraph
          copyable={{
            text: async () =>
              new Promise((resolve) => {
                setTimeout(() => {
                  resolve('Request text');
                }, 500);
              }),
          }}
        >
          Request copy text.
        </Paragraph>
        <Text copyable={{ text: 'text to be copied' }} />
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
