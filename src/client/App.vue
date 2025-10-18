<script lang="tsx">
import { ConfigProvider } from '@/components';
import { defineComponent } from 'vue';
import zhCN from '@/components/locale/zh_CN';
import 'dayjs/locale/zh-cn';
import Demo from './Demo';
import SelectDemo from './demo/SelectDemo';

export default defineComponent({
  setup() {
    return () => (
      <div style={{ margin: '100px' }}>
        <ConfigProvider locale={zhCN}>
          <SelectDemo></SelectDemo>
          <Demo></Demo>
        </ConfigProvider>
      </div>
    );
  },
});
</script>
