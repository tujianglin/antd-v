import { isVueNode } from '@/vc-util/Children/util';
const toList = <T>(candidate: T | T[], skipEmpty = false): T[] => {
  if (skipEmpty && !isVueNode(candidate)) {
    return [];
  }
  return Array.isArray(candidate) ? candidate : [candidate];
};

export default toList;
