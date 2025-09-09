import InternalAlert from './Alert.vue';
import ErrorBoundary from './ErrorBoundary.vue';

export type { AlertProps } from './Alert.vue';

type CompoundedComponent = typeof InternalAlert & {
  ErrorBoundary: typeof ErrorBoundary;
};

const Alert = InternalAlert as CompoundedComponent;

Alert.ErrorBoundary = ErrorBoundary;

export default Alert;
