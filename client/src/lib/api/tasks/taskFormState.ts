export type TaskFormValues = {
  title: string;
  description: string;
  priority: string;
  deadline: string;
};

export type TaskFormState = {
  success: boolean;
  error: string | null;
  fieldErrors?: Record<string, string>;
  values?: TaskFormValues;
};

export const INITIAL_TASK_FORM_STATE: TaskFormState = {
  success: false,
  error: null,
};
