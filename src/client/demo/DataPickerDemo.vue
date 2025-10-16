<script lang="tsx">
import { DatePicker, Flex, Space } from '@/components';
import dayjs from 'dayjs';
import { defineComponent } from 'vue';

const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';
export default defineComponent({
  setup() {
    return () => (
      <>
        <Space vertical>
          <DatePicker />
          <DatePicker picker="week" />
          <DatePicker picker="month" />
          <DatePicker picker="quarter" />
          <DatePicker picker="year" />
        </Space>
        <Space vertical size={12}>
          <RangePicker />
          <RangePicker showTime />
          <RangePicker picker="week" />
          <RangePicker picker="month" />
          <RangePicker picker="quarter" />
          <RangePicker
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
        <Flex vertical gap="small">
          <DatePicker multiple maxTagCount="responsive" size="small" />
          <DatePicker multiple maxTagCount="responsive" />
          <DatePicker multiple maxTagCount="responsive" size="large" />
        </Flex>
        <DatePicker
          value={dayjs('2019-09-03', dateFormat)}
          minDate={dayjs('2019-08-01', dateFormat)}
          maxDate={dayjs('2020-10-31', dateFormat)}
        />
      </>
    );
  },
});
</script>
<style lang="less" scoped></style>
