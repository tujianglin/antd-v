<script lang="tsx">
import { Button, message, Popconfirm, type PopconfirmProps } from '@/components';
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    const confirm: PopconfirmProps['onConfirm'] = (e) => {
      console.log(e);
      message.success('Click on Yes');
    };

    const cancel: PopconfirmProps['onCancel'] = (e) => {
      console.log(e);
      message.error('Click on No');
    };

    return () => (
      <>
        <Popconfirm
          title="Delete the task"
          description="Are you sure to delete this task?"
          onConfirm={confirm}
          onCancel={cancel}
          okText="Yes"
          cancelText="No"
        >
          <Button danger>Delete</Button>
        </Popconfirm>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
