import { describe, expect, it, vi } from "vitest";

import { createFormSubmitHandler } from "../../../lib/form/create-form-submit-handler";

describe("createFormSubmitHandler", () => {
  it("prevents default, stops propagation, and invokes handleSubmit", () => {
    const handleSubmit = vi.fn();
    const preventDefault = vi.fn();
    const stopPropagation = vi.fn();

    const submit = createFormSubmitHandler(handleSubmit);

    submit(
      {
        preventDefault,
        stopPropagation,
      } as never,
    );

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});
