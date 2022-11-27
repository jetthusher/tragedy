import {
  createActorSystem,
  createNativeProviderFactory,
  delay,
} from "./mod.ts";
import { pingMessage } from "./messages.ts";

const providerFactory = createNativeProviderFactory("test");
const actorSystem = createActorSystem("main", providerFactory);

const pingWorkerPath = new URL("./ping-worker.ts", import.meta.url);
const pongWorkerPath = new URL("./pong-worker.ts", import.meta.url);
const selfWorkerPath = new URL("./self-worker.ts", import.meta.url);

new Worker(pingWorkerPath, { type: "module" });
new Worker(pongWorkerPath, { type: "module" });
new Worker(selfWorkerPath, { type: "module" });

const ping = {
  ...pingMessage,
  headers: {
    sender: "pong-actor",
    receiver: "ping-actor",
    isError: false,
  },
}

const self = {
    type: "me",
    headers: {
        sender: "self-actor",
        receiver: "self-actor",
        isError: false,
    }
}

actorSystem.send(self);
actorSystem.send(ping)

actorSystem.connectActor("hi", ({ name }) => ({
    onConnected: () => {},
    onMessage: msg => msg
}))

console.log();
console.log("---[Main thread has sent a message to a message bus]---");
console.log();

await delay(1000);
