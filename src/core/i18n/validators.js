import * as validators from '@vuelidate/validators';
import i18next from '@core/i18n';
const i18n = i18next.init();

const { createI18nMessage } = validators;
const messagePath = ({ $validator }) => `validations.${$validator}`;
export const withI18nMessage = createI18nMessage({
  t: i18n.t.bind(i18n),
  messagePath
});

export const required = withI18nMessage(validators.required);
export const minLength = withI18nMessage(validators.minLength, {
  withArguments: true
});
export const maxLength = withI18nMessage(validators.maxLength, {
  withArguments: true
});
