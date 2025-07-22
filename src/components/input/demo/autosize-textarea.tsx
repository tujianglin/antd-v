import { defineComponent, ref } from 'vue';
import Input from '..';

export default defineComponent({
  setup() {
    const value = ref('');
    return () => (
      <>
        <Input.TextArea placeholder="Autosize height based on content lines" autoSize />
        <div style={{ margin: '24px 0' }} />
        <Input.TextArea
          placeholder="Autosize height with minimum and maximum number of lines"
          autoSize={{ minRows: 2, maxRows: 6 }}
        />
        <div style={{ margin: '24px 0' }} />
        <Input.TextArea v-model:value={value.value} placeholder="Controlled autosize" autoSize={{ minRows: 3, maxRows: 5 }} />
      </>
    );
  },
});
