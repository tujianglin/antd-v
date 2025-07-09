import { createApp } from 'vue';
import '../styles/index.css';
import App from './App.vue';

const bootstrap = async () => {
  const app = createApp(App);

  app.mount('#app');
};

bootstrap();
