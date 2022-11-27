import {
  Actor,
  ActorSystem,
  ActorUtils,
  Message,
  MessagingQueueProvider,
  ReceivedMessage,
} from "./types.ts";

export const createMessage = <
  Type extends string,
  Payload,
  Meta extends Record<string, unknown>,
  ActorMessage extends Message<Type, Payload, Meta>,
>(
  message: ActorMessage,
) => {
  if (typeof message !== "object" || Array.isArray(message)) {
    throw new TypeError("Message must be an object");
  }

  if (!Object.hasOwn(message, "type")) {
    throw new TypeError("Message must have a 'type' property");
  }

  if (typeof message.type !== "string") {
    throw new TypeError("Message's `type` property must be a string");
  }

  if (message.type.length === 0) {
    throw new TypeError(
      "Message's `type` property must not be an empty string",
    );
  }

  if (Object.hasOwn(message, "meta") && typeof message.meta !== "object") {
    throw new TypeError("Message's `meta` property must be an object");
  }

  if (
    Object.keys(message).some((key) =>
      !["type", "payload", "meta"].includes(key)
    )
  ) {
    throw new TypeError(
      "Message cannot have properties other than `type`, `payload`, and `meta`",
    );
  }

  return message;
};

export const createActor = <ActorMessage extends Message>(
  actorOrActorFactory:
    | Actor<ActorMessage>
    | ((utils: ActorUtils<ActorMessage>) => Actor<ActorMessage>),
) => actorOrActorFactory;

export const createNativeProviderFactory =
  (name: string) => (): MessagingQueueProvider => {
    const bc = new BroadcastChannel(name);
    let handlerPointer: (e: MessageEvent) => void;

    return {
      onMessage: (handler) => {
        handlerPointer = (e) => handler(e.data);
        bc.addEventListener("message", handlerPointer);
      },
      send: (message) => {
        const messageEvent = new MessageEvent("message", {
          data: message,
        });

        // BroadcastChannel doesn't fire `message` event
        // for sending entities, so we need to `dispatchEvent`
        // explicitly to make `sendToSelf` work
        bc.dispatchEvent(messageEvent);
        bc.postMessage(message);
      },
      start: () => {
      },
      stop: () => {
        bc?.close();
        if (handlerPointer) {
          bc.removeEventListener("message", handlerPointer);
        }
      },
    };
  };

export const delay = (timeout: number) =>
  new Promise((res) => {
    setTimeout(res, timeout);
  });

export const createActorSystem = (
  scope: string,
  providerFactory: () => MessagingQueueProvider,
): ActorSystem => {
  const mq = providerFactory();
  const actorMap: Map<string, Actor> = new Map();

  mq.onMessage((message) => {
    if (actorMap.has(message.headers.receiver)) {
      const { sender, receiver } = message.headers;
      console.log(`${scope}: [${sender} -> ${receiver}]: ${message.type}`);
      const actor = actorMap.get(message.headers.receiver)!;
      const messageWithUtilityMethods: ReceivedMessage = {
        ...message,
        reply: async (replyMessage) => {
          await delay(1000);
          mq.send({
            ...replyMessage,
            headers: {
              sender: message.headers.receiver,
              receiver: message.headers.sender,
              isError: replyMessage instanceof Error,
            },
          });
        },
      };

      if (typeof actor.onMessage === "function") {
        actor.onMessage(messageWithUtilityMethods);
      } else {
        actor.onMessage[message.type]?.(messageWithUtilityMethods);
      }
    }
  });

  return {
    connectActor: (senderName, actorOrActorFactory) => {
      if (actorMap.has(senderName)) return;

      let actor: Actor;

      if (typeof actorOrActorFactory === "function") {
        actor = actorOrActorFactory({
          name: senderName,
          getActor: (receiverName) => ({
            send: (message, options) => {
              mq.send({
                ...message,
                headers: {
                  sender: senderName,
                  receiver: receiverName,
                  isError: message.payload instanceof Error,
                  ...options?.headerOverrides,
                },
              });
            },
          }),
          sendToSelf: (message, options) => {
            mq.send({
              ...message,
              headers: {
                sender: senderName,
                receiver: senderName,
                isError: message.payload instanceof Error,
                ...options?.headerOverrides,
              },
            });
          },
        }) as Actor;
      } else {
        actor = actorOrActorFactory as Actor;
      }

      actor.onConnected?.();
      actorMap.set(senderName, actor);
    },
    disconnectActor: (name) => {
      if (actorMap.has(name)) {
        const actor = actorMap.get(name)!;
        actor.onDisconnected?.();
        actorMap.delete(name);
      }
    },
    start: () => mq.start(),
    stop: () => mq.stop(),
    send: (message) => mq.send(message),
  };
};
