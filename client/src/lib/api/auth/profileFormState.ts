export type ProfileFormValues = {
  username: string;
  email: string;
  fullName: string;
  avatarUrl: string;
};

export type ProfileFormState = {
  success: boolean;
  error: string | null;
  fieldErrors?: Record<string, string>;
  values?: ProfileFormValues;
};

export function initialProfileFormState(values: ProfileFormValues): ProfileFormState {
  return { success: false, error: null, values };
}

export type ChangePasswordFormState = {
  success: boolean;
  error: string | null;
  fieldErrors?: Record<string, string>;
};

export const INITIAL_CHANGE_PASSWORD_FORM_STATE: ChangePasswordFormState = {
  success: false,
  error: null,
};
