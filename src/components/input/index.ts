export type { InputRef } from '../../vc-component/input';
import InternalInput from './Input.vue';
import OTP from './OTP/index.vue';
import Password from './Password.vue';
import Search from './Search.vue';
import TextArea from './TextArea.vue';

export type { InputProps } from './interface';
export type { SearchProps } from './Search.vue';
export type { TextAreaProps } from './TextArea.vue';

type CompoundedComponent = typeof InternalInput & {
  Search: typeof Search;
  TextArea: typeof TextArea;
  Password: typeof Password;
  OTP: typeof OTP;
};

const Input = InternalInput as CompoundedComponent;
Input.Search = Search;
Input.TextArea = TextArea;
Input.Password = Password;
Input.OTP = OTP;

export default Input;
