export type ProjectFormValues = {
  title: string;
  deadline: string;
  allowFreeSwap: boolean;
};

export type ProjectFormState = {
  success: boolean;
  error: string | null;
  fieldErrors?: Record<string, string>;
  values?: ProjectFormValues;
};

export const INITIAL_PROJECT_FORM_STATE: ProjectFormState = {
  success: false,
  error: null,
};
