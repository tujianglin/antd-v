import { onBeforeUnmount, onMounted, ref, unref, watch } from 'vue';

/**
 * Vue 版本 useLayoutEffect
 * @param callback - 接收 firstMount 的回调，可返回 cleanup 函数
 * @param deps - 响应式依赖数组，可选
 */
export function useLayoutEffect(callback: (firstMount: boolean) => any, deps: Array<any> = []) {
  const firstMountRef = ref(true);
  let cleanup;

  const runEffect = () => {
    if (cleanup) cleanup();
    cleanup = callback(firstMountRef.value);
  };

  // 初次挂载
  onMounted(() => {
    runEffect();
    firstMountRef.value = false;
  });

  // 依赖变化时重新执行
  if (deps.length > 0) {
    watch(
      deps.map((dep) => () => unref(dep)), // 解包响应式
      () => {
        runEffect();
      },
      { flush: 'post' }, // 尽量模拟 React useLayoutEffect 的时序
    );
  }

  // 组件卸载时执行 cleanup
  onBeforeUnmount(() => {
    if (cleanup) cleanup();
    firstMountRef.value = true;
  });
}
