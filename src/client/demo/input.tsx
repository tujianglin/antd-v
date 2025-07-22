import Addon from '@/components/input/demo/addon';
import AutoSizeTextarea from '@/components/input/demo/autosize-textarea';
import Basic from '@/components/input/demo/basic';
import CompactStyle from '@/components/input/demo/compact-style';
import Otp from '@/components/input/demo/otp';
import PasswordInput from '@/components/input/demo/password-input';
import SearchInput from '@/components/input/demo/search-input';
import SearchInputLoading from '@/components/input/demo/search-input-loading';
import Size from '@/components/input/demo/size';
import Textarea from '@/components/input/demo/textarea';
import Variant from '@/components/input/demo/variant';

import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    return () => (
      <>
        <PasswordInput></PasswordInput>
        <Basic></Basic>
        <Size></Size>
        <Variant></Variant>
        <CompactStyle></CompactStyle>
        <Addon></Addon>
        <SearchInput></SearchInput>
        <SearchInputLoading></SearchInputLoading>
        <Textarea></Textarea>
        <AutoSizeTextarea></AutoSizeTextarea>
        <Otp></Otp>
      </>
    );
  },
});
