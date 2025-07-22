import Basic from '@/components/radio/demo/basic';
import Disabled from '@/components/radio/demo/disabled';
import RadioButton from '@/components/radio/demo/radiobutton';
import RadioGroup from '@/components/radio/demo/radiogroup';
import RadioGroupMore from '@/components/radio/demo/radiogroup-more';
import RadioGroupOptions from '@/components/radio/demo/radiogroup-options';

import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    return () => (
      <>
        <Basic></Basic>
        <Disabled></Disabled>
        <RadioButton></RadioButton>
        <RadioGroup></RadioGroup>
        <RadioGroupMore></RadioGroupMore>
        <RadioGroupOptions></RadioGroupOptions>
      </>
    );
  },
});
