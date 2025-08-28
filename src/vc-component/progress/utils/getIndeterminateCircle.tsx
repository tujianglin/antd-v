import type { CSSProperties } from 'vue';

interface IndeterminateOption {
  id: string;
  loading: boolean;
}

export default ({ id, loading }: IndeterminateOption) => {
  if (!loading) {
    return {
      indeterminateStyleProps: {} as CSSProperties,
      indeterminateStyleAnimation: null,
    };
  }

  const animationName = `${id}-indeterminate-animate`;

  return {
    indeterminateStyleProps: {
      transform: 'rotate(0deg)',
      animation: `${animationName} 1s linear infinite`,
    } as CSSProperties,
    indeterminateStyleAnimation: (
      <style>
        {`@keyframes ${animationName} {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }`}
      </style>
    ),
  };
};
