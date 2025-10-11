export enum StringKeys {
  WELCOME = 'WELCOME',
  APP_NAME = 'APP_NAME',
  LOREM_IPSUM = 'LOREM_IPSUM',
  FAQ = 'FAQ',
  ABOUT_APP_NAME = 'ABOUT_APP_NAME',
  ABOUT_OMOC = 'ABOUT_OMOC',
  LOGIN = 'LOGIN',
  LOGIN_WITH = 'LOGIN_WITH',
  LOGIN_WITH_GOOGLE = 'LOGIN_WITH_GOOGLE',
  REGISTER_WITH_GOOGLE = 'REGISTER_WITH_GOOGLE',
  AGREEMENT = 'AGREEMENT',
  TERMS_CONDITIONS = 'TERMS_CONDITIONS',
  AND = 'AND',
  PRICACY_POLICY = 'PRICACY_POLICY',
  CREATE_ACCOUNT = 'CREATE_ACCOUNT',
  SING_UP = 'SING_UP',
  SIGN_IN = 'SIGN_IN',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
}

export enum PlaceholderKeys {
  EMAIL_NUMBER = 'EMAIL_NUMBER',
  PASSWORD = 'PASSWORD',
  NAME = 'NAME',
  USERNAME = 'USERNAME',
  AGE = 'AGE',
}

export const strings: Record<StringKeys, string> = {
  [StringKeys.WELCOME]: 'Welcome to',
  [StringKeys.APP_NAME]: 'Fit Fromal',
  [StringKeys.LOREM_IPSUM]: 'Lorem ipsum dolor sit amet, ',
  [StringKeys.FAQ]: 'FAQ',
  [StringKeys.ABOUT_APP_NAME]: ' about Fit Fromal.',
  [StringKeys.ABOUT_OMOC]: ' about Fit Fromal.',
  [StringKeys.LOGIN]: 'Login',
  [StringKeys.LOGIN_WITH]: 'Login With',
  [StringKeys.LOGIN_WITH_GOOGLE]: 'Login with Google',
  [StringKeys.REGISTER_WITH_GOOGLE]: 'Register with Google',
  [StringKeys.AGREEMENT]: 'By logging in you agree to our ',
  [StringKeys.TERMS_CONDITIONS]: 'Terms & Conditions',
  [StringKeys.AND]: 'and',
  [StringKeys.PRICACY_POLICY]: 'Privacy Policy',
  [StringKeys.CREATE_ACCOUNT]: "Don't have an account?",
  [StringKeys.SING_UP]: 'Sign Up',
  [StringKeys.SIGN_IN]: 'Sign In',
  [StringKeys.FORGOT_PASSWORD]: 'Forgot Password?',
};

export const palceholders: Record<PlaceholderKeys, string> = {
  [PlaceholderKeys.EMAIL_NUMBER]: 'Email or phone number',
  [PlaceholderKeys.PASSWORD]: 'Password',
  [PlaceholderKeys.NAME]: 'First Name',
  [PlaceholderKeys.USERNAME]: 'Last Name',
  [PlaceholderKeys.AGE]: 'Phone Number',
};
