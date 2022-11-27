export const queueTask = (callback: (...args: unknown[]) => unknown) => {
  const mc = new MessageChannel();
  mc.port1.onmessage = callback;
  mc.port2.postMessage("");
};
