import { z } from "@deps";
import { Message } from "./types.ts";

const headlessMessageSchema = z.object({
  type: z.string(),
  payload: z.any(),
  meta: z.record(z.unknown()).optional(),
});

const sentMessageSchema = z.object({
  ...headlessMessageSchema.shape,
  headers: z.object({
    sender: z.string(),
    receiver: z.string(),
    isError: z.boolean(),
    isReply: z.boolean(),
  }),
});

const receivedMessageSchema = z.object({
    ...sentMessageSchema.shape,
    reply: z.function().args().returns(z.void()),
    forward: z.function().returns(z.void())
})

type Test = z.infer<typeof receivedMessageSchema>;
