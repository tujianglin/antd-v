import { isValidElement } from '@/components/_util/isValidNode';
import { toArray } from '@/vc-util/Children/toArray';
import { cloneVNode } from 'vue';

export function parseChildren(children: any, keyPath: string[]) {
  return toArray(children).map((child, index) => {
    if (isValidElement(child)) {
      const { key } = child;
      let eventKey = (child.props as any)?.eventKey ?? key;

      const emptyKey = eventKey === null || eventKey === undefined;

      if (emptyKey) {
        eventKey = `tmp_key-${[...keyPath, index].join('-')}`;
      }

      const cloneProps = { key: eventKey, eventKey } as any;

      if (process.env.NODE_ENV !== 'production' && emptyKey) {
        cloneProps.warnKey = true;
      }

      return cloneVNode(child, cloneProps);
    }

    return child;
  });
}
