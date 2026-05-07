import type { FormEvent } from "react";

type SubmitHandler = () => void | Promise<void>;

type FormWithSubmitHandler = {
  handleSubmit: SubmitHandler;
};

export function createFormSubmitHandler(
  formOrSubmitHandler: FormWithSubmitHandler | SubmitHandler,
): (event: FormEvent<HTMLFormElement>) => void {
  const handleSubmit =
    typeof formOrSubmitHandler === "function"
      ? formOrSubmitHandler
      : formOrSubmitHandler.handleSubmit;

  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    void handleSubmit();
  };
}
