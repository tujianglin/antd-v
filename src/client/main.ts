import { createApp } from 'vue';
import App from './App.vue';
// import './index.css';

const bootstrap = async () => {
  const app = createApp(App);

  app.mount('#app');
};

bootstrap();
