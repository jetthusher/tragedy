import {
  createActor,
  createActorSystem,
  createNativeProviderFactory,
} from "./mod.ts";
import type { pingMessage } from "./messages.ts";
import { pongMessage } from "./messages.ts";

const nativeProvider = createNativeProviderFactory("test");
const actorSystem = createActorSystem("ping", nativeProvider);

const actor = createActor<typeof pingMessage>({
  onConnected: () => console.log("ping-actor connected in", import.meta.url),
  onMessage: {
    ping: (msg) => msg.reply(pongMessage),
  },
});

actorSystem.connectActor("ping-actor", actor);
