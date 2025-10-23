<script lang="tsx">
import { Alert, Switch } from '@/components';
import { defineComponent, ref } from 'vue';
export default defineComponent({
  setup() {
    const visible = ref(true);

    const handleClose = () => {
      visible.value = false;
    };

    return () => (
      <>
        {visible.value && <Alert title="Alert Message Text" type="success" closable afterClose={handleClose} />}
        <p>click the close button to see the effect</p>
        <Switch v-model:checked={visible.value} disabled={visible.value} />
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
