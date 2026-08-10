export type ProjectFormState = {
  success: boolean;
  error: string | null;
  fieldErrors?: Record<string, string>;
};

export const INITIAL_PROJECT_FORM_STATE: ProjectFormState = {
  success: false,
  error: null,
};
