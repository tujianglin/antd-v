import { Input } from '@/components';
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    return () => (
      <>
        <Input.TextArea rows={4} />
        <br />
        <br />
        <Input.TextArea rows={4} placeholder="maxLength is 6" maxlength={6} />
      </>
    );
  },
});
