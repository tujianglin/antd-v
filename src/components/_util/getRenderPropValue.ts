export type RenderFunction = () => any;

export const getRenderPropValue = (propValue?: any | RenderFunction): any => {
  if (!propValue) {
    return null;
  }

  return typeof propValue === 'function' ? propValue() : propValue;
};
