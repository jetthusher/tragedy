export type DerrivedActorMessage<T> = T[keyof T] extends ((...args: any) => any)
  ? ReturnType<T[keyof T]>
  : T[keyof T];

export interface Message<
  Type extends string = string,
  Payload = unknown,
  Meta extends Record<string, unknown> = Record<string, unknown>,
> {
  type: Type;
  payload?: Payload;
  meta?: Meta;
}

export interface ActorMessageMapSchema {
  [key: string]: {
    messages: Message;
    replies: Record<
      ActorMessageMapSchema[keyof ActorMessageMapSchema]["messages"]["type"],
      unknown
    >;
  };
}

interface MessageHeaders<
  Payload = unknown,
  Sender extends string = string,
  Receiver extends string = string,
> {
  sender: Sender;
  receiver: Receiver;
  isError: Payload extends Error ? true : boolean;
}

export type SentMessage<
  T extends Message = Message,
  Sender extends string = string,
  Receiver extends string = string,
> = T & { headers: MessageHeaders<T["payload"], Sender, Receiver> };

interface MessageUtilities {
  reply: (data: Message) => void;
}

export type ReceivedMessage<
  ActorMessage extends SentMessage = SentMessage,
  ActorMessageReplies extends ActorMessageMapSchema[string]["replies"] =
    ActorMessageMapSchema[string]["replies"],
> =
  & ActorMessage
  & MessageUtilities;

type ExtractMessage<ActorMessage extends Message, Type extends string> =
  Extract<ActorMessage, Message<Type>>;

export type MessageMap<
  ActorMessage extends Message = Message,
  ActorMessageReplies extends ActorMessageMapSchema[string]["replies"] =
    ActorMessageMapSchema[string]["replies"],
  Sender extends string = string,
> = {
  [Type in ActorMessage["type"]]: (
    message: ReceivedMessage<
      SentMessage<ExtractMessage<ActorMessage, Type>, Sender>,
      ActorMessageReplies
    > extends never ? ReceivedMessage<
        SentMessage<ActorMessage, Sender>,
        ActorMessageReplies
      >
      : ReceivedMessage<
        SentMessage<ExtractMessage<ActorMessage, Type>, Sender>,
        ActorMessageReplies
      >,
  ) => void;
};

interface SendOptions {
  headerOverrides?: Partial<Pick<SentMessage["headers"], "isError">>;
}

export interface ActorFrontend<
  ActorMessage extends Message = Message,
> {
  send: (
    message: ActorMessage,
    options?: SendOptions,
  ) => void;
}

export interface Actor<
  ActorMessage extends Message = Message,
  ActorMessageReplies extends ActorMessageMapSchema[string]["replies"] =
    ActorMessageMapSchema[string]["replies"],
  Sender extends string = string,
> {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onMessage:
    | MessageMap<ActorMessage, ActorMessageReplies>
    | ((message: ReceivedMessage<SentMessage<ActorMessage, Sender>>) => void);
}

export interface ActorUtils<
  ActorMessage extends Message = Message,
> {
  name: string;
  sendToSelf: ActorFrontend<ActorMessage>["send"];
  getActor: <T extends Message>(
    name: string,
  ) => ActorFrontend<T>;
}

export interface MessagingQueueProvider {
  onMessage: (handler: (message: SentMessage) => void) => void;
  send: (message: SentMessage) => void;
  start: () => void;
  stop: () => void;
}

export interface ActorSystem {
  connectActor: <T extends Message>(
    name: string,
    actorOrActorFactory: Actor<T> | ((utils: ActorUtils) => Actor<T>),
  ) => void;
  disconnectActor: (name: string) => void;
  start: () => void;
  stop: () => void;
  send: (message: SentMessage) => void;
}
