<script lang="tsx">
import { Button, Spin } from '@/components';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  setup() {
    const spinning = ref(false);
    const percent = ref(0);

    const showLoader = () => {
      spinning.value = true;
      let ptg = -10;

      const interval = setInterval(() => {
        ptg += 5;
        percent.value = ptg;

        if (ptg > 12000) {
          clearInterval(interval);
          spinning.value = false;
          percent.value = 0;
        }
      }, 100);
    };

    return () => (
      <>
        <Button onClick={showLoader}>Show fullscreen</Button>
        <Spin spinning={spinning.value} percent={percent.value} fullscreen />
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
