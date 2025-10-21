import { createApp, h, type App, type Component } from 'vue';

const MARK = '__vc_vue_app__';

// ========================== Render ==========================
type ContainerType = (Element | DocumentFragment) & {
  [MARK]?: App<Element>;
};

export function render(component: Component, container: ContainerType, props?: Record<string, any>) {
  // Vue 不支持 mount 到 Fragment，因此自动包装一个 div
  let mountEl: HTMLElement;
  if (container instanceof DocumentFragment) {
    mountEl = document.createElement('div');
    document.body.appendChild(mountEl);
  } else {
    mountEl = container as HTMLElement;
  }

  const app = createApp({
    render: () => h(component, props),
  });
  app.mount(mountEl);

  container[MARK] = app;
}

// ========================= Unmount ==========================
export async function unmount(container: ContainerType) {
  return Promise.resolve().then(() => {
    const app = container[MARK];
    if (app) {
      app.unmount();
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete container[MARK];
    }
  });
}
