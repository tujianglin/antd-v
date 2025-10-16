<script lang="tsx">
import { Button, ConfigProvider, notification } from '@/components';
import { defineComponent } from 'vue';
import zhCN from '@/components/locale/zh_CN';
import 'dayjs/locale/zh-cn';
import Demo from './Demo';

export default defineComponent({
  setup() {
    const openNotification = () => {
      notification?.open({
        title: 'Notification Title',
        description: () => <div>11111</div>,
      });
    };
    return () => (
      <div style={{ margin: '100px' }}>
        <ConfigProvider locale={zhCN}>
          <Button type="primary" onClick={openNotification}>
            Open the notification box
          </Button>
          <Demo></Demo>
        </ConfigProvider>
      </div>
    );
  },
});
</script>
