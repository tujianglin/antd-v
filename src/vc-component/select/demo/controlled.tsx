import { defineComponent, ref } from 'vue';
import Select, { Option } from '..';

export default defineComponent({
  setup() {
    const value = ref(9);
    const open = ref(true);
    const onChange = (e) => {
      console.log(e);
    };

    const onBlur = (v) => {
      console.log('onBlur', v);
    };

    const onFocus = () => {
      console.log('onFocus');
    };

    const onPopupVisibleChange = (val) => {
      open.value = val;
    };

    const onActive = (value) => {
      console.log('onActive', value);
    };
    return () => (
      <div style={{ margin: `${20}px` }}>
        <h2>controlled Select</h2>
        <div style={{ width: `${300}px` }}>
          <Select
            id="my-select"
            value={value}
            placeholder="placeholder"
            listHeight={200}
            style={{ width: 500 }}
            onBlur={onBlur}
            onFocus={onFocus}
            showSearch={{
              optionFilterProp: 'text',
            }}
            optionLabelProp="children"
            onChange={onChange}
            onPopupVisibleChange={onPopupVisibleChange}
            onActive={onActive}
          >
            <Option value="01" text="jack" title="jack">
              <b
                style={{
                  color: 'red',
                }}
              >
                jack
              </b>
            </Option>
            <Option value="11" text="lucy">
              lucy
            </Option>
            <Option value="21" disabled text="disabled">
              disabled
            </Option>
            <Option value="31" text="yiminghe">
              yiminghe
            </Option>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <Option key={i} value={i} text={String(i)}>
                {i}-text
              </Option>
            ))}
          </Select>
        </div>
      </div>
    );
  },
});
