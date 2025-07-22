import { Radio } from '@/components';
import type { CheckboxGroupProps } from '@/components/checkbox/Group.vue';
import { defineComponent, ref } from 'vue';
import type { RadioChangeEvent } from '../interface';

const plainOptions: CheckboxGroupProps<string>['options'] = ['Apple', 'Pear', 'Orange'];

const options: CheckboxGroupProps<string>['options'] = [
  { label: 'Apple', value: 'Apple', class: 'label-1' },
  { label: 'Pear', value: 'Pear', class: 'label-2' },
  { label: 'Orange', value: 'Orange', title: 'Orange', class: 'label-3' },
];

const optionsWithDisabled: CheckboxGroupProps<string>['options'] = [
  { label: 'Apple', value: 'Apple', class: 'label-1' },
  { label: 'Pear', value: 'Pear', class: 'label-2' },
  { label: 'Orange', value: 'Orange', class: 'label-3', disabled: true },
];

export default defineComponent({
  setup() {
    const value1 = ref('Apple');
    const value2 = ref('Apple');
    const value3 = ref('Apple');
    const value4 = ref('Apple');

    const onChange1 = ({ target: { value } }: RadioChangeEvent) => {
      console.log('radio1 checked', value);
      value1.value = value;
    };

    const onChange2 = ({ target: { value } }: RadioChangeEvent) => {
      console.log('radio2 checked', value);
      value2.value = value;
    };

    const onChange3 = ({ target: { value } }: RadioChangeEvent) => {
      console.log('radio3 checked', value);
      value3.value = value;
    };

    const onChange4 = ({ target: { value } }: RadioChangeEvent) => {
      console.log('radio4 checked', value);
      value4.value = value;
    };

    return () => (
      <>
        <Radio.Group options={plainOptions} onChange={onChange1} value={value1} />
        <br />
        <Radio.Group options={optionsWithDisabled} onChange={onChange2} value={value2} />
        <br />
        <br />
        <Radio.Group options={options} onChange={onChange3} value={value3} optionType="button" />
        <br />
        <br />
        <Radio.Group options={optionsWithDisabled} onChange={onChange4} value={value4} optionType="button" buttonStyle="solid" />
      </>
    );
  },
});
