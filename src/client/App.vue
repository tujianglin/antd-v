<script lang="tsx">
import { ConfigProvider, DatePicker, Flex, Space } from '@/components';
import { defineComponent, effect, ref } from 'vue';
import zhCN from '@/components/locale/zh_CN';
import 'dayjs/locale/zh-cn';
import dayjs from 'dayjs';

export default defineComponent({
  setup() {
    const value = ref(dayjs('2015-01-01', 'YYYY-MM-DD'));
    effect(() => {
      console.log(value.value);
    });
    const onChange = (e, v) => {
      console.log(e, v);
    };
    return () => (
      <div style={{ margin: '100px' }}>
        <ConfigProvider locale={zhCN}>
          <Flex vertical gap="small">
            <Space vertical size={12}>
              <DatePicker v-model:value={value.value} format={'YYYY-MM-DD HH:mm:ss'} onChange={onChange} />
              <DatePicker onChange={onChange} picker="week" />
              <DatePicker onChange={onChange} picker="month" />
              <DatePicker onChange={onChange} picker="quarter" />
              <DatePicker onChange={onChange} picker="year" />
              <DatePicker.RangePicker onChange={onChange} />
              <DatePicker.RangePicker onChange={onChange} showTime />
              <DatePicker.RangePicker onChange={onChange} picker="week" />
              <DatePicker.RangePicker onChange={onChange} picker="month" />
              <DatePicker.RangePicker onChange={onChange} picker="quarter" />
              <DatePicker.RangePicker
                onChange={onChange}
                picker="year"
                id={{
                  start: 'startInput',
                  end: 'endInput',
                }}
                onFocus={(_, info) => {
                  console.log('Focus:', info.range);
                }}
                onBlur={(_, info) => {
                  console.log('Blur:', info.range);
                }}
              />
            </Space>
          </Flex>
        </ConfigProvider>
      </div>
    );
  },
});
</script>

<style lang="less">
@import '@/vc-component/cascader/assets/index.less';
</style>
