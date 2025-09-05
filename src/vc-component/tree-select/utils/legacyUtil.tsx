import { isValidElement } from '@/components/_util/isValidNode';
import { TreeNode } from '@/vc-component/tree';
import { toArray } from '@/vc-util/Children/toArray';
import warning from '@/vc-util/warning';
import type { ChangeEventExtra, DataNode, FieldNames, VueKey } from '../interface';

export function convertChildrenToData(nodes: any): DataNode[] {
  return toArray(nodes)
    .map((node: any) => {
      if (!isValidElement(node) || !node.type) {
        return null;
      }

      const {
        key,
        props: { children, value, ...restProps },
      } = node as any;

      const data = {
        key,
        value,
        ...restProps,
      };

      const childData = convertChildrenToData(children);
      if (childData.length) {
        data.children = childData;
      }

      return data;
    })
    .filter((data) => data);
}

export function fillLegacyProps(dataNode: DataNode) {
  if (!dataNode) {
    return dataNode;
  }

  const cloneNode = { ...dataNode };

  if (!('props' in cloneNode)) {
    Object.defineProperty(cloneNode, 'props', {
      get() {
        warning(
          false,
          'New `rc-tree-select` not support return node instance as argument anymore. Please consider to remove `props` access.',
        );
        return cloneNode;
      },
    });
  }

  return cloneNode;
}

export function fillAdditionalInfo(
  extra: ChangeEventExtra,
  triggerValue: VueKey,
  checkedValues: VueKey[],
  treeData: DataNode[],
  showPosition: boolean,
  fieldNames: FieldNames,
) {
  let triggerNode = null;
  let nodeList: any[] = null;

  function generateMap() {
    function dig(list: DataNode[], level = '0', parentIncluded = false) {
      return list
        .map((option, index) => {
          const pos = `${level}-${index}`;
          const value = option[fieldNames.value];
          const included = checkedValues.includes(value);
          const children = dig(option[fieldNames.children] || [], pos, included);
          const node = <TreeNode {...(option as Required<DataNode>)}>{children.map((child) => child.node)}</TreeNode>;

          // Link with trigger node
          if (triggerValue === value) {
            triggerNode = node;
          }

          if (included) {
            const checkedNode = {
              pos,
              node,
              children,
            };

            if (!parentIncluded) {
              nodeList.push(checkedNode);
            }

            return checkedNode;
          }
          return null;
        })
        .filter((node) => node);
    }

    if (!nodeList) {
      nodeList = [];

      dig(treeData);

      // Sort to keep the checked node length
      nodeList.sort(
        (
          {
            node: {
              props: { value: val1 },
            },
          },
          {
            node: {
              props: { value: val2 },
            },
          },
        ) => {
          const index1 = checkedValues.indexOf(val1);
          const index2 = checkedValues.indexOf(val2);
          return index1 - index2;
        },
      );
    }
  }

  Object.defineProperty(extra, 'triggerNode', {
    get() {
      warning(false, '`triggerNode` is deprecated. Please consider decoupling data with node.');
      generateMap();

      return triggerNode;
    },
  });
  Object.defineProperty(extra, 'allCheckedNodes', {
    get() {
      warning(false, '`allCheckedNodes` is deprecated. Please consider decoupling data with node.');
      generateMap();

      if (showPosition) {
        return nodeList;
      }

      return nodeList.map(({ node }) => node);
    },
  });
}
