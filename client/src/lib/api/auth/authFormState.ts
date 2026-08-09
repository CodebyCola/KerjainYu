export type AuthFormState = {
  error: string | null;
  fieldErrors?: Record<string, string>;
};

export const INITIAL_AUTH_FORM_STATE: AuthFormState = {
  error: null,
};
