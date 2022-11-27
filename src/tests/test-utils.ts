export const getUniqueString = () => performance.now().toString();
export const getRandomNumber = () => Math.round(Math.random() * 1000);
export const createSuit = (name: string) => ({
  it: (behaviour: string, callback: () => void) =>
    Deno.test(`${name} — ${behaviour}`, callback),
});
