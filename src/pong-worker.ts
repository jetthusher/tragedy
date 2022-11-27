import {
  createActor,
  createActorSystem,
  createNativeProviderFactory,
} from "./mod.ts";
import type { pongMessage } from "./messages.ts";
import { pingMessage } from "./messages.ts";

const nativeProvider = createNativeProviderFactory("test");
const actorSystem = createActorSystem("pong", nativeProvider);

const actor = createActor<typeof pongMessage>({
  onConnected: () => console.log("pong-actor connected in", import.meta.url),
  onMessage: {
    pong: (msg) => msg.reply(pingMessage),
  },
});

actorSystem.connectActor("pong-actor", actor);
