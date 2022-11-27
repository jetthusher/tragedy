import {
  createActor,
  createActorSystem,
  createNativeProviderFactory,
} from "./mod.ts";

const nativeProvider = createNativeProviderFactory("test");
const actorSystem = createActorSystem("self", nativeProvider);

const actor = createActor({
  onConnected: () => console.log("self-actor connected in", import.meta.url),
  onMessage: msg => msg.reply({ type: "me" }),
});

actorSystem.connectActor("self-actor", actor);
