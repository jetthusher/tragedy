import { asserts } from "@dev_deps";
import { createMessage } from "../mod.ts";
import { createSuit, getRandomNumber, getUniqueString } from "./test-utils.ts";

const { assertThrows, assertObjectMatch } = asserts;
const { it } = createSuit("message creator");

it("throws when arg is not an object", () => {
  // @ts-expect-error: testing behaviour
  assertThrows(() => createMessage());
});

it("throws when argument not an object", () => {
  const variants = [
    undefined,
    [1, 2, 3],
    Function,
    3,
    class Test {},
    new Map(),
    new Promise(() => {}),
  ];

  variants.forEach((variant) => {
    // @ts-expect-error: testing behaviour
    assertThrows(() => createMessage(variant));
  });
});

it("throws when `type` property is not specified", () => {
  const msg1 = {};
  const msg2 = { payload: 3 };
  const msg3 = { meta: {} };
  const msgs = [msg1, msg2, msg3];

  msgs.forEach((msg) => {
    // @ts-expect-error: testing behaviour
    assertThrows(() => createMessage(msg));
  });
});

it("throws when `type` property is not a string", () => {
  const variants = [
    14,
    {},
    new String(),
    [],
  ];

  variants.forEach((variant) => {
    // @ts-expect-error: testing behaviour
    assertThrows(() => createMessage({ type: variant }));
  });
});

it("throws when `type` property is an empty string", () => {
  assertThrows(() => createMessage({ type: "" }));
});

it("throws when `meta` property is not an object", () => {
  const variants = [
    undefined,
    [1, 2, 3],
    Function,
    3,
    class Test {},
    new Map(),
    new Promise(() => {}),
  ];

  variants.forEach((variant) => {
    // @ts-expect-error: testing behaviour
    assertThrows(() => createMessage({ meta: variant }));
  });
});

it("throws when extra keys are specified", () => {
  assertThrows(() =>
    createMessage({
      type: "test-1",
      extra: "property",
    })
  );

  assertThrows(() =>
    createMessage({
      type: "test-2",
      meta: { allowed: "extra property" },
      throws: "error",
    })
  );

  assertThrows(() =>
    createMessage({
      type: "test-3",
      payload: { test: 3 },
      alien: "isolation",
    })
  );

  assertThrows(() =>
    createMessage({
      type: "test-4",
      payload: { what: "a joke" },
      meta: { really: "funny stuff" },
      i: "don't get it",
    })
  );
});
