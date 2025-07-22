import { Button, Radio } from '@/components';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  setup() {
    const disabled = ref(true);
    const toggleDisabled = () => {
      disabled.value = !disabled.value;
    };

    return () => (
      <>
        <Radio checked={false} disabled={disabled.value}>
          Disabled
        </Radio>
        <Radio checked disabled={disabled.value}>
          Disabled
        </Radio>
        <br />
        <Button type="primary" onClick={toggleDisabled} style={{ marginTop: '16px' }}>
          Toggle disabled
        </Button>
      </>
    );
  },
});
