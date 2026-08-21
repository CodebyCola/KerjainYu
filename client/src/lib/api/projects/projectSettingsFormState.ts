export type ProjectSettingsFormValues = {
  title: string;
  deadline: string;
  allowFreeSwap: boolean;
};

export type ProjectSettingsFormState = {
  success: boolean;
  error: string | null;
  fieldErrors?: Record<string, string>;
  values?: ProjectSettingsFormValues;
};

export function initialProjectSettingsFormState(
  values: ProjectSettingsFormValues,
): ProjectSettingsFormState {
  return { success: false, error: null, values };
}
