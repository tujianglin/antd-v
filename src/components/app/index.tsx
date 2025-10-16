import type { AppProps } from './App.vue';
import App_ from './App.vue';
import { useApp } from './context';

export type { AppProps };

type CompoundedComponent = typeof App_ & {
  useApp: typeof useApp;
};

const App = App_ as CompoundedComponent;

App.useApp = useApp;

export default App;
