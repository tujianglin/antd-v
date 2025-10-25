<script lang="tsx">
import { Radio, Typography } from '@/components';
import { CheckOutlined, HighlightOutlined } from '@ant-design/icons-vue';
import { computed, defineComponent, ref } from 'vue';

const { Paragraph } = Typography;

export default defineComponent({
  setup() {
    const editableStr = ref('This is an editable text.');
    const editableStrWithSuffix = ref('This is a loooooooooooooooooooooooooooooooong editable text with suffix.');
    const aaa = computed(() => [editableStrWithSuffix.value.slice(0, -12), editableStrWithSuffix.value.slice(-12)]);
    const editableStrWithSuffixStartPart = computed(() => aaa.value?.[0]);
    const editableStrWithSuffixSuffixPart = computed(() => aaa.value?.[1]);
    const customIconStr = ref('Custom Edit icon and replace tooltip text.');
    const clickTriggerStr = ref('Text or icon as trigger - click to start editing.');
    const chooseTrigger = ref<('icon' | 'text')[]>(['icon']);
    const customEnterIconStr = ref('Editable text with a custom enter icon in edit field.');
    const noEnterIconStr = ref('Editable text with no enter icon in edit field.');
    const hideTooltipStr = ref('Hide Edit tooltip.');
    const lengthLimitedStr = ref('This is an editable text with limited length.');

    const radioToState = (input: string): ('icon' | 'text')[] => {
      switch (input) {
        case 'text':
          return ['text'];
        case 'both':
          return ['icon', 'text'];
        case 'icon':
          return ['icon'];
        default:
          return ['icon'];
      }
    };

    const stateToRadio = computed<string>(() => {
      if (chooseTrigger.value.includes('text')) {
        return chooseTrigger.value.includes('icon') ? 'both' : 'text';
      }
      return 'icon';
    });
    return () => (
      <>
        <Paragraph editable={{ onChange: (e) => (editableStr.value = e) }}>{editableStr.value}</Paragraph>
        <Paragraph
          editable={{
            onChange: (e) => (editableStrWithSuffix.value = e),
            text: editableStrWithSuffix.value,
          }}
          ellipsis={{
            suffix: editableStrWithSuffixSuffixPart.value,
          }}
        >
          {editableStrWithSuffixStartPart.value}
        </Paragraph>
        <Paragraph
          editable={{
            icon: <HighlightOutlined />,
            tooltip: 'click to edit text',
            onChange: (e) => (customIconStr.value = e),
          }}
        >
          {customIconStr.value}
        </Paragraph>
        Trigger edit with:{' '}
        <Radio.Group
          onChange={(e) => (chooseTrigger.value = radioToState(e.target.value))}
          value={stateToRadio.value}
          options={[
            { label: 'icon', value: 'icon' },
            { label: 'text', value: 'text' },
            { label: 'both', value: 'both' },
          ]}
        ></Radio.Group>
        <Paragraph
          editable={{
            tooltip: 'click to edit text',
            onChange: (e) => (clickTriggerStr.value = e),
            triggerType: chooseTrigger.value,
          }}
        >
          {clickTriggerStr.value}
        </Paragraph>
        <Paragraph
          editable={{
            icon: <HighlightOutlined />,
            tooltip: 'click to edit text',
            onChange: (e) => (customEnterIconStr.value = e),
            enterIcon: <CheckOutlined />,
          }}
        >
          {customEnterIconStr.value}
        </Paragraph>
        <Paragraph
          editable={{
            icon: <HighlightOutlined />,
            tooltip: 'click to edit text',
            onChange: (e) => (noEnterIconStr.value = e),
            enterIcon: null,
          }}
        >
          {noEnterIconStr.value}
        </Paragraph>
        <Paragraph editable={{ tooltip: false, onChange: (e) => (hideTooltipStr.value = e) }}>{hideTooltipStr.value}</Paragraph>
        <Paragraph
          editable={{
            onChange: (e) => (lengthLimitedStr.value = e),
            maxlength: 50,
            autoSize: { maxRows: 5, minRows: 3 },
          }}
        >
          {lengthLimitedStr.value}
        </Paragraph>
        <Typography.Title editable level={1} style={{ margin: 0 }}>
          h1. Ant Design
        </Typography.Title>
        <Typography.Title editable level={2} style={{ margin: 0 }}>
          h2. Ant Design
        </Typography.Title>
        <Typography.Title editable level={3} style={{ margin: 0 }}>
          h3. Ant Design
        </Typography.Title>
        <Typography.Title editable level={4} style={{ margin: 0 }}>
          h4. Ant Design
        </Typography.Title>
        <Typography.Title editable level={5} style={{ margin: 0 }}>
          h5. Ant Design
        </Typography.Title>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
