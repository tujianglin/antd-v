import isMobile from 'is-mobile';

let cached: boolean;

export default () => {
  if (typeof cached === 'undefined') {
    // @ts-ignore This expression is not callable.
    cached = isMobile?.();
  }

  return cached;
};
