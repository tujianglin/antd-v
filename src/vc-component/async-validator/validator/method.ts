import type { ExecuteValidator } from '../interface';
import rules from '../rule';
import { isEmptyValue } from '../util';

const method: ExecuteValidator = (rule, value, callback, source, options) => {
  const errors: string[] = [];
  // eslint-disable-next-line no-prototype-builtins
  const validate = rule.required || (!rule.required && source.hasOwnProperty(rule.field));
  if (validate) {
    if (isEmptyValue(value) && !rule.required) {
      return callback();
    }
    rules.required(rule, value, source, errors, options);
    if (value !== undefined) {
      rules.type(rule, value, source, errors, options);
    }
  }
  callback(errors);
};

export default method;
