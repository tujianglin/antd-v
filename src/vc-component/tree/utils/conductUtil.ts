import type { VueKey } from '@/vc-util/type';
import warning from '@/vc-util/warning';
import type { BasicDataNode, DataEntity, DataNode, GetCheckDisabled, KeyEntities } from '../interface';
import getEntity from './keyUtil';

interface ConductReturnType {
  checkedKeys: VueKey[];
  halfCheckedKeys: VueKey[];
}

function removeFromCheckedKeys(halfCheckedKeys: Set<VueKey>, checkedKeys: Set<VueKey>) {
  const filteredKeys = new Set<VueKey>();
  halfCheckedKeys.forEach((key) => {
    if (!checkedKeys.has(key)) {
      filteredKeys.add(key);
    }
  });
  return filteredKeys;
}

export function isCheckDisabled<TreeDataType>(node: TreeDataType) {
  const { disabled, disableCheckbox, checkable } = (node || {}) as DataNode;
  return !!(disabled || disableCheckbox) || checkable === false;
}

// Fill miss keys
function fillConductCheck<TreeDataType extends BasicDataNode = DataNode>(
  keys: Set<VueKey>,
  levelEntities: Map<number, Set<DataEntity<TreeDataType>>>,
  maxLevel: number,
  syntheticGetCheckDisabled: GetCheckDisabled<TreeDataType>,
): ConductReturnType {
  const checkedKeys = new Set<VueKey>(keys);
  const halfCheckedKeys = new Set<VueKey>();

  // Add checked keys top to bottom
  for (let level = 0; level <= maxLevel; level += 1) {
    const entities = levelEntities.get(level) || new Set();
    entities.forEach((entity) => {
      const { key, node, children = [] } = entity;

      if (checkedKeys.has(key) && !syntheticGetCheckDisabled(node)) {
        children
          .filter((childEntity) => !syntheticGetCheckDisabled(childEntity.node))
          .forEach((childEntity) => {
            checkedKeys.add(childEntity.key);
          });
      }
    });
  }

  // Add checked keys from bottom to top
  const visitedKeys = new Set<VueKey>();
  for (let level = maxLevel; level >= 0; level -= 1) {
    const entities = levelEntities.get(level) || new Set();
    entities.forEach((entity) => {
      const { parent, node } = entity;

      // Skip if no need to check
      if (syntheticGetCheckDisabled(node) || !entity.parent || visitedKeys.has(entity.parent.key)) {
        return;
      }

      // Skip if parent is disabled
      if (syntheticGetCheckDisabled(entity.parent.node)) {
        visitedKeys.add(parent.key);
        return;
      }

      let allChecked = true;
      let partialChecked = false;

      (parent.children || [])
        .filter((childEntity) => !syntheticGetCheckDisabled(childEntity.node))
        .forEach(({ key }) => {
          const checked = checkedKeys.has(key);
          if (allChecked && !checked) {
            allChecked = false;
          }
          if (!partialChecked && (checked || halfCheckedKeys.has(key))) {
            partialChecked = true;
          }
        });

      if (allChecked) {
        checkedKeys.add(parent.key);
      }
      if (partialChecked) {
        halfCheckedKeys.add(parent.key);
      }

      visitedKeys.add(parent.key);
    });
  }

  return {
    checkedKeys: Array.from(checkedKeys),
    halfCheckedKeys: Array.from(removeFromCheckedKeys(halfCheckedKeys, checkedKeys)),
  };
}

// Remove useless key
function cleanConductCheck<TreeDataType extends BasicDataNode = DataNode>(
  keys: Set<VueKey>,
  halfKeys: VueKey[],
  levelEntities: Map<number, Set<DataEntity<TreeDataType>>>,
  maxLevel: number,
  syntheticGetCheckDisabled: GetCheckDisabled<TreeDataType>,
): ConductReturnType {
  const checkedKeys = new Set<VueKey>(keys);
  let halfCheckedKeys = new Set<VueKey>(halfKeys);

  // Remove checked keys from top to bottom
  for (let level = 0; level <= maxLevel; level += 1) {
    const entities = levelEntities.get(level) || new Set();
    entities.forEach((entity) => {
      const { key, node, children = [] } = entity;

      if (!checkedKeys.has(key) && !halfCheckedKeys.has(key) && !syntheticGetCheckDisabled(node)) {
        children
          .filter((childEntity) => !syntheticGetCheckDisabled(childEntity.node))
          .forEach((childEntity) => {
            checkedKeys.delete(childEntity.key);
          });
      }
    });
  }

  // Remove checked keys form bottom to top
  halfCheckedKeys = new Set<VueKey>();
  const visitedKeys = new Set<VueKey>();
  for (let level = maxLevel; level >= 0; level -= 1) {
    const entities = levelEntities.get(level) || new Set();

    entities.forEach((entity) => {
      const { parent, node } = entity;

      // Skip if no need to check
      if (syntheticGetCheckDisabled(node) || !entity.parent || visitedKeys.has(entity.parent.key)) {
        return;
      }

      // Skip if parent is disabled
      if (syntheticGetCheckDisabled(entity.parent.node)) {
        visitedKeys.add(parent.key);
        return;
      }

      let allChecked = true;
      let partialChecked = false;

      (parent.children || [])
        .filter((childEntity) => !syntheticGetCheckDisabled(childEntity.node))
        .forEach(({ key }) => {
          const checked = checkedKeys.has(key);
          if (allChecked && !checked) {
            allChecked = false;
          }
          if (!partialChecked && (checked || halfCheckedKeys.has(key))) {
            partialChecked = true;
          }
        });

      if (!allChecked) {
        checkedKeys.delete(parent.key);
      }
      if (partialChecked) {
        halfCheckedKeys.add(parent.key);
      }

      visitedKeys.add(parent.key);
    });
  }

  return {
    checkedKeys: Array.from(checkedKeys),
    halfCheckedKeys: Array.from(removeFromCheckedKeys(halfCheckedKeys, checkedKeys)),
  };
}

/**
 * Conduct with keys.
 * @param keyList current key list
 * @param keyEntities key - dataEntity map
 * @param mode `fill` to fill missing key, `clean` to remove useless key
 */
export function conductCheck<TreeDataType extends BasicDataNode = DataNode>(
  keyList: VueKey[],
  checked: true | { checked: false; halfCheckedKeys: VueKey[] },
  keyEntities: KeyEntities<TreeDataType>,
  getCheckDisabled?: GetCheckDisabled<TreeDataType>,
): ConductReturnType {
  const warningMissKeys: VueKey[] = [];

  let syntheticGetCheckDisabled: GetCheckDisabled<TreeDataType>;
  if (getCheckDisabled) {
    syntheticGetCheckDisabled = getCheckDisabled;
  } else {
    syntheticGetCheckDisabled = isCheckDisabled;
  }

  // We only handle exist keys
  const keys = new Set<VueKey>(
    keyList.filter((key) => {
      const hasEntity = !!getEntity(keyEntities, key);
      if (!hasEntity) {
        warningMissKeys.push(key);
      }

      return hasEntity;
    }),
  );
  const levelEntities = new Map<number, Set<DataEntity<TreeDataType>>>();
  let maxLevel = 0;

  // Convert entities by level for calculation
  Object.keys(keyEntities).forEach((key) => {
    const entity = keyEntities[key];
    const { level } = entity;

    let levelSet: Set<DataEntity<TreeDataType>> = levelEntities.get(level);
    if (!levelSet) {
      levelSet = new Set();
      levelEntities.set(level, levelSet);
    }

    levelSet.add(entity);

    maxLevel = Math.max(maxLevel, level);
  });

  warning(
    !warningMissKeys.length,
    `Tree missing follow keys: ${warningMissKeys
      .slice(0, 100)
      .map((key) => `'${String(key)}'`)
      .join(', ')}`,
  );

  let result: ConductReturnType;
  if (checked === true) {
    result = fillConductCheck<TreeDataType>(keys, levelEntities, maxLevel, syntheticGetCheckDisabled);
  } else {
    result = cleanConductCheck(keys, checked.halfCheckedKeys, levelEntities, maxLevel, syntheticGetCheckDisabled);
  }

  return result;
}
