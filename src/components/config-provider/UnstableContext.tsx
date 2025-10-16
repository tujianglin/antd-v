import { render, unmount } from '@/vc-util/Dom/render';

export type UnmountType = () => Promise<void>;
export type RenderType = (node: any, container: Element | DocumentFragment) => UnmountType;

const defaultReactRender: RenderType = (node, container) => {
  render(node, container);
  return () => {
    return unmount(container);
  };
};

let unstableRender: RenderType = defaultReactRender;

export function unstableSetRender(render?: RenderType) {
  if (render) {
    unstableRender = render;
  }
  return unstableRender;
}
