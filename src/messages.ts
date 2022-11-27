import { createMessage } from "./mod.ts";

export const pingMessage = createMessage({
  type: "ping",
});

export const pongMessage = createMessage({
  type: "pong",
});

export const fooMessage = createMessage({
  type: "foo",
});

export const barMessage = createMessage({
  type: "bar",
});
