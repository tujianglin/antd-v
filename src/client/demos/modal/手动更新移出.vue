<script lang="tsx">
import { Button, Modal } from '@/components';
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    const [modal, ContextHolder] = Modal.useModal();
    const countDown = () => {
      let secondsToGo = 5;

      const instance = modal.success({
        title: 'This is a notification message',
        content: `This modal will be destroyed after ${secondsToGo} second.`,
      });

      const timer = setInterval(() => {
        secondsToGo -= 1;
        instance.update({
          content: `This modal will be destroyed after ${secondsToGo} second.`,
        });
      }, 1000);

      setTimeout(() => {
        clearInterval(timer);
        instance.destroy();
      }, secondsToGo * 1000);
    };

    return () => (
      <>
        <Button onClick={countDown}>Open modal to close in 5s</Button>
        <ContextHolder></ContextHolder>
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
