import { defineComponent, ref } from 'vue';
import Select, { Option } from '..';

const arrowPath =
  'M632 888H392c-4.4 0-8 3.6-8 8v32c0 ' +
  '17.7 14.3 32 32 32h192c17.7 0 32-14.3 32-32v-3' +
  '2c0-4.4-3.6-8-8-8zM512 64c-181.1 0-328 146.9-3' +
  '28 328 0 121.4 66 227.4 164 284.1V792c0 17.7 1' +
  '4.3 32 32 32h264c17.7 0 32-14.3 32-32V676.1c98' +
  '-56.7 164-162.7 164-284.1 0-181.1-146.9-328-32' +
  '8-328z m127.9 549.8L604 634.6V752H420V634.6l-3' +
  '5.9-20.8C305.4 568.3 256 484.5 256 392c0-141.4' +
  ' 114.6-256 256-256s256 114.6 256 256c0 92.5-49' +
  '.4 176.3-128.1 221.8z';

const clearPath =
  'M793 242H366v-74c0-6.7-7.7-10.4-12.9' +
  '-6.3l-142 112c-4.1 3.2-4.1 9.4 0 12.6l142 112c' +
  '5.2 4.1 12.9 0.4 12.9-6.3v-74h415v470H175c-4.4' +
  ' 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h618c35.3 0 64-' +
  '28.7 64-64V306c0-35.3-28.7-64-64-64z';

const menuItemSelectedIcon = (props) => (
  <span style={{ position: 'absolute', right: 0, opacity: props.disabled ? 0.5 : 1 }}>{props.isSelected ? '🌹' : '☑️'}</span>
);

const singleItemIcon = (
  <span style={{ position: 'absolute', right: '0px' }} role="img" aria-label="rose">
    🌹
  </span>
);

const getSvg = (path) => (
  <i>
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor" style={{ verticalAlign: '-.125em ' }}>
      <path d={path} p-id="5827" />
    </svg>
  </i>
);

const CustomIconComponent = defineComponent({
  setup() {
    const disabled = ref(false);
    const value = ref('');
    const onChange = (val, option) => {
      console.log('onChange', val, option);
      value.value = val;
    };

    const onKeyDown = (e) => {
      if (e.keyCode === 13) {
        console.log('onEnter', value.value);
      }
    };

    const onSelect = (v, option) => {
      console.log('onSelect', v, option);
    };

    const toggleDisabled = () => {
      disabled.value = !disabled.value;
    };
    return () => (
      <div>
        <h2>combobox</h2>
        <p>
          <button type="button" onClick={toggleDisabled}>
            toggle disabled
          </button>
        </p>
        <div style={{ width: `${300}px` }}>
          <Select
            class="custom-select"
            disabled={disabled.value}
            style={{ width: '500px' }}
            onChange={onChange}
            onSelect={onSelect}
            onInputKeyDown={onKeyDown}
            notFoundContent=""
            allowClear={{ clearIcon: getSvg(clearPath) }}
            placeholder="please select"
            v-model:value={value.value}
            mode="combobox"
            backfill
            prefix="Foobar"
            suffixIcon={({ searchValue }) => {
              if (searchValue) {
                return '😺';
              }
              return getSvg(arrowPath);
            }}
            removeIcon={getSvg(clearPath)}
            menuItemSelectedIcon={singleItemIcon}
          >
            <Option value="jack">
              <b style={{ color: 'red' }}>jack</b>
            </Option>
            <Option value="lucy">lucy</Option>
            <Option value="disabled" disabled>
              disabled
            </Option>
            <Option value="yiminghe">yiminghe</Option>
          </Select>
        </div>
      </div>
    );
  },
});

const children = [];
for (let i = 10; i < 36; i += 1) {
  children.push(
    <Option key={i.toString(36) + i} disabled={i === 10} title={`中文${i}`}>
      中文{i}
    </Option>,
  );
}

const Test = defineComponent({
  setup() {
    const value = ref('a10');
    const useAnim = ref(true);
    const onChange = (val, options) => {
      console.log('onChange', val, options);
      value.value = val;
    };

    const onSelect = (...args) => {
      console.log(args);
    };

    const onDeselect = (...args) => {
      console.log(args);
    };

    const useAnim1 = (e) => {
      useAnim.value = e.target.checked;
    };
    return () => (
      <div>
        <h2>multiple select（scroll the menu）</h2>

        <p>
          <label html-for="useAnim">
            anim
            <input id="useAnim" checked={useAnim.value} type="checkbox" onChange={useAnim1} />
          </label>
        </p>
        <div style={{ width: `${300}px` }}>
          <Select
            class="custom-select"
            v-model:value={value.value}
            animation={useAnim ? 'slide-up' : null}
            choiceTransitionName="rc-select-selection__choice-zoom"
            style={{ width: `${500}px` }}
            mode="multiple"
            allowClear={{ clearIcon: getSvg(clearPath) }}
            showSearch={{
              optionFilterProp: 'children',
            }}
            optionLabelProp="children"
            onSelect={onSelect}
            onDeselect={onDeselect}
            placeholder="please select"
            onChange={onChange}
            onFocus={() => console.log('focus')}
            tokenSeparators={[' ', ',']}
            prefix="Foobar"
            suffixIcon={getSvg(arrowPath)}
            removeIcon={getSvg(clearPath)}
            menuItemSelectedIcon={menuItemSelectedIcon}
          >
            {children}
          </Select>
        </div>
      </div>
    );
  },
});

export default defineComponent({
  setup() {
    return () => (
      <div>
        <CustomIconComponent />
        <br />
        <Test />
      </div>
    );
  },
});
