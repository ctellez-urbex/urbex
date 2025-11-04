import { CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserAttribute, ISignUpResult } from 'amazon-cognito-identity-js';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Helper function to get environment variables from static file or process.env
function getStaticEnvVar(key: string, fallback: string = ''): string {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // In development, prioritize process.env (from .env.local)
  // In production/static builds, prioritize window.ENV
  if (isDevelopment) {
    // Development: process.env first (from .env.local)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔧 [DEV] Using ${key} from process.env`);
      }
      return process.env[key];
    }
    
    // Fallback to window.ENV in development
    if (typeof window !== 'undefined' && window.ENV && window.ENV[key]) {
      console.log(`⚠️ [DEV] Using ${key} from window.ENV (fallback)`);
      return window.ENV[key];
    }
  } else {
    // Production/Static: window.ENV first
    if (typeof window !== 'undefined' && window.ENV && window.ENV[key]) {
      return window.ENV[key];
    }
    
    // Fallback to process.env
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  }
  
  return fallback;
}

// AWS Cognito configuration
const getPoolData = () => {
  // Use NEXT_PUBLIC_ prefixed variables for client-side access
  const userPoolId = getStaticEnvVar('NEXT_PUBLIC_AWS_USER_POOL_ID') || 
                     getStaticEnvVar('AWS_USER_POOL_ID') || 
                     'us-east-2_Fpda5LMX0';
  const clientId = getStaticEnvVar('NEXT_PUBLIC_AWS_POOL_CLIENT_ID') || 
                   getStaticEnvVar('AWS_POOL_CLIENT_ID') || 
                   '5kvmdd29oj2lpnq9b4j60gfe69';
  const region = getStaticEnvVar('NEXT_PUBLIC_AWS_REGION') || 
                 getStaticEnvVar('AWS_REGION') || 
                 'us-east-2';

  // Log configuration in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Cognito Configuration:', {
      userPoolId: userPoolId.substring(0, 20) + '...',
      clientId: clientId.substring(0, 10) + '...',
      region,
      source: 'Development mode - using .env.local',
      fullUserPoolId: userPoolId,
      fullClientId: clientId
    });
    
    // Verify configuration
    if (!userPoolId || userPoolId.includes('your_') || userPoolId.includes('tu_')) {
      console.error('❌ Invalid User Pool ID:', userPoolId);
    }
    if (!clientId || clientId.includes('your_') || clientId.includes('tu_')) {
      console.error('❌ Invalid Client ID:', clientId);
    }
  }

  return {
    UserPoolId: userPoolId,
    ClientId: clientId,
    Region: region
  };
};

// Lazy initialization to avoid build-time errors
let userPool: CognitoUserPool | null = null;

const getUserPool = () => {
  if (!userPool) {
    const poolData = getPoolData();
    
    // Only validate configuration in browser environment when actually needed
    // if (isBrowser && process.env.NODE_ENV === 'production') {
      // const hasValidConfig = poolData.UserPoolId.length > 20 && poolData.ClientId.length > 20;
      // if (!hasValidConfig) {
      //   throw new Error('AWS Cognito configuration is missing. Please check your environment variables.');
      // }
    // }
    
    userPool = new CognitoUserPool(poolData);
  }
  return userPool;
};

// Check if we're in a valid environment for AWS operations
const canUseAWS = () => {
  return isBrowser && process.env.NODE_ENV !== 'test';
};

// Types
export interface SignUpParams {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  plan: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
  code: string;
  newPassword: string;
}

// Authentication Service
export const authService = {
  // Register a new user
  async signUp({ email, password, firstName, lastName, phone, plan }: SignUpParams): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!canUseAWS()) {
        resolve({ success: false, error: 'Service not available in this environment' });
        return;
      }

      try {
        const pool = getUserPool();
        const attributeList = [
          new CognitoUserAttribute({
            Name: 'given_name',
            Value: firstName
          }),
          new CognitoUserAttribute({
            Name: 'family_name',
            Value: lastName
          }),
          new CognitoUserAttribute({
            Name: 'name',
            Value: `${firstName} ${lastName}`
          }),
          new CognitoUserAttribute({
            Name: 'email',
            Value: email
          }),
          new CognitoUserAttribute({
            Name: 'phone_number',
            Value: phone
          }),
          new CognitoUserAttribute({
            Name: 'custom:plan',
            Value: plan
          }),
          new CognitoUserAttribute({
            Name: 'custom:su',
            Value: '1' // Default value for new users (must be greater than 1)
          })
        ];

        pool.signUp(email, password, attributeList, [], (err: Error | undefined, result: ISignUpResult | undefined) => {
          if (err) {
            console.error('🔴 SignUp error:', err);
            console.log('📧 Email used:', email);
            console.log('📋 Attributes:', attributeList);
            resolve({ success: false, error: err.message });
            return;
          }
          
          console.log('✅ SignUp successful:', result);
          console.log('📧 User created with email:', email);
          console.log('📋 User confirmed:', result?.userConfirmed);
          
          // TODO: Once custom:plan attribute is created in Cognito, update the user with the plan
          // This can be done using adminUpdateUserAttributes after the user is created
          // For now, the plan is stored in the frontend and can be set by admin later
          
          resolve({ success: true });
        });
      } catch (error) {
        resolve({ success: false, error: error instanceof Error ? error.message : 'Configuration error' });
      }
    });
  },

  // Confirm user registration with verification code
  async confirmSignUp(email: string, code: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!canUseAWS()) {
        resolve({ success: false, error: 'Service not available in this environment' });
        return;
      }

      try {
        const pool = getUserPool();
        const userData = {
          Username: email,
          Pool: pool
        };

        const cognitoUser = new CognitoUser(userData);
        cognitoUser.confirmRegistration(code, true, (err: Error | undefined, result: string) => {
          if (err) {
            resolve({ success: false, error: err.message });
            return;
          }
          resolve({ success: true });
        });
      } catch (error) {
        resolve({ success: false, error: error instanceof Error ? error.message : 'Configuration error' });
      }
    });
  },

  // Resend verification code
  async resendConfirmationCode(email: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!canUseAWS()) {
        resolve({ success: false, error: 'Service not available in this environment' });
        return;
      }

      try {
        const pool = getUserPool();
        const userData = {
          Username: email,
          Pool: pool
        };

        const cognitoUser = new CognitoUser(userData);
        cognitoUser.resendConfirmationCode((err: Error | undefined, result: string) => {
          if (err) {
            resolve({ success: false, error: err.message });
            return;
          }
          resolve({ success: true });
        });
      } catch (error) {
        resolve({ success: false, error: error instanceof Error ? error.message : 'Configuration error' });
      }
    });
  },

  // Sign in user
  async signIn({ email, password }: SignInParams): Promise<{ success: boolean; token?: string; error?: string }> {
    return new Promise((resolve) => {
      if (!canUseAWS()) {
        resolve({ success: false, error: 'Service not available in this environment' });
        return;
      }

      try {
        console.log('🔍 Starting authentication process...');
        console.log('🔍 Current URL:', typeof window !== 'undefined' ? window.location.href : 'N/A');
        console.log('🔍 Environment:', process.env.NODE_ENV);
        
        const pool = getUserPool();
        const poolData = getPoolData();
        console.log('🔍 User pool obtained successfully');
        console.log('🔍 Pool configuration:', {
          UserPoolId: poolData.UserPoolId.substring(0, 20) + '...',
          ClientId: poolData.ClientId.substring(0, 10) + '...',
          Region: poolData.Region
        });
        
        const authenticationDetails = new AuthenticationDetails({
          Username: email,
          Password: password
        });
        console.log('🔍 Authentication details created');

        const userData = {
          Username: email,
          Pool: pool
        };

        const cognitoUser = new CognitoUser(userData);
        console.log('🔍 Cognito user created');
        
        // Use ALLOW_USER_PASSWORD_AUTH flow by setting auth flow type
        cognitoUser.setAuthenticationFlowType('USER_PASSWORD_AUTH');
        console.log('🔍 Authentication flow type set to USER_PASSWORD_AUTH');
        
        cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: (result) => {
            const token = result.getIdToken().getJwtToken();
            console.log('✅ Login successful');
            resolve({ success: true, token });
          },
          onFailure: (err: Error) => {
            console.error('🔴 Authentication error:', err);
            console.log('📧 Email used:', email);
            console.log('🔍 Error name:', err.name);
            console.log('🔍 Error message:', err.message);
            console.log('🔍 Full error object:', err);
            
            // Provide more specific error messages
            let errorMessage = err.message;
            const errorString = err.message.toLowerCase();
            
                      // Handle NotAuthorizedException variations and standalone messages
          if (errorString.includes('notauthorizedexception') || errorString.includes('not authorized') || 
              errorString.includes('user is disabled') || errorString.includes('disabled')) {
            if (errorString.includes('incorrect username or password') || errorString.includes('incorrect password')) {
              errorMessage = 'Email o contraseña incorrectos. ¿Ya te registraste y confirmaste tu email?';
            } else if (errorString.includes('user is disabled') || errorString.includes('disabled')) {
              errorMessage = 'Tu cuenta está deshabilitada. Contacta al administrador para habilitarla.';
            } else if (errorString.includes('password attempts exceeded') || errorString.includes('too many failed attempts')) {
              errorMessage = 'Demasiados intentos fallidos. Tu cuenta ha sido bloqueada temporalmente.';
            } else {
              errorMessage = 'No tienes autorización para acceder. Verifica tus credenciales.';
            }
          } 
            // Handle UserNotConfirmedException
            else if (errorString.includes('usernotconfirmedexception') || errorString.includes('user not confirmed')) {
              errorMessage = 'Debes confirmar tu email antes de iniciar sesión. Revisa tu correo.';
            } 
            // Handle UserNotFoundException
            else if (errorString.includes('usernotfoundexception') || errorString.includes('user does not exist')) {
              errorMessage = 'No existe una cuenta con este email. Regístrate primero.';
            } 
            // Handle TooManyRequestsException
            else if (errorString.includes('toomanyrequestsexception') || errorString.includes('rate exceeded')) {
              errorMessage = 'Demasiados intentos de login. Espera unos minutos antes de intentar de nuevo.';
            }
            // Handle PasswordResetRequiredException
            else if (errorString.includes('passwordresetrequiredexception') || errorString.includes('password reset required')) {
              errorMessage = 'Debes cambiar tu contraseña. Usa la opción "Olvidé mi contraseña".';
            }
            // Handle other common errors
            else if (errorString.includes('network') || errorString.includes('connection')) {
              errorMessage = 'Error de conexión. Verifica tu internet e intenta de nuevo.';
            }
            
            console.log('✅ Mapped error message:', errorMessage);
            resolve({ success: false, error: errorMessage });
          },
          newPasswordRequired: (userAttributes, requiredAttributes) => {
            resolve({ success: false, error: 'Se requiere establecer una nueva contraseña' });
          }
        });
      } catch (error) {
        console.error('🔴 Configuration/Authentication error caught in try-catch:', error);
        console.log('🔍 Error type:', typeof error);
        console.log('🔍 Error constructor:', error?.constructor?.name);
        if (error instanceof Error) {
          console.log('🔍 Error message:', error.message);
          console.log('🔍 Error stack:', error.stack);
        }
        
        let errorMessage = 'Error de configuración';
        
        if (error instanceof Error) {
          const errorString = error.message.toLowerCase();
          // Apply the same error mapping logic here
          if (errorString.includes('notauthorizedexception') || errorString.includes('not authorized') || 
              errorString.includes('user is disabled') || errorString.includes('disabled')) {
            if (errorString.includes('incorrect username or password') || errorString.includes('incorrect password')) {
              errorMessage = 'Email o contraseña incorrectos. ¿Ya te registraste y confirmaste tu email?';
            } else if (errorString.includes('user is disabled') || errorString.includes('disabled')) {
              errorMessage = 'Tu cuenta está deshabilitada. Contacta al administrador para habilitarla.';
            } else if (errorString.includes('password attempts exceeded') || errorString.includes('too many failed attempts')) {
              errorMessage = 'Demasiados intentos fallidos. Tu cuenta ha sido bloqueada temporalmente.';
            } else {
              errorMessage = 'No tienes autorización para acceder. Verifica tus credenciales.';
            }
          } else if (errorString.includes('usernotconfirmedexception') || errorString.includes('user not confirmed')) {
            errorMessage = 'Debes confirmar tu email antes de iniciar sesión. Revisa tu correo.';
          } else if (errorString.includes('usernotfoundexception') || errorString.includes('user does not exist')) {
            errorMessage = 'No existe una cuenta con este email. Regístrate primero.';
          } else if (errorString.includes('toomanyrequestsexception') || errorString.includes('rate exceeded')) {
            errorMessage = 'Demasiados intentos de login. Espera unos minutos antes de intentar de nuevo.';
          } else if (errorString.includes('passwordresetrequiredexception') || errorString.includes('password reset required')) {
            errorMessage = 'Debes cambiar tu contraseña. Usa la opción "Olvidé mi contraseña".';
          } else if (errorString.includes('network') || errorString.includes('connection')) {
            errorMessage = 'Error de conexión. Verifica tu internet e intenta de nuevo.';
          } else {
            errorMessage = error.message;
          }
        }
        
        console.log('✅ Mapped error message from catch block:', errorMessage);
        resolve({ success: false, error: errorMessage });
      }
    });
  },

  // Request password reset
  async forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!canUseAWS()) {
        resolve({ success: false, error: 'Service not available in this environment' });
        return;
      }

      try {
        const pool = getUserPool();
        const userData = {
          Username: email,
          Pool: pool
        };

        const cognitoUser = new CognitoUser(userData);
        cognitoUser.forgotPassword({
          onSuccess: () => {
            resolve({ success: true });
          },
          onFailure: (err: Error) => {
            resolve({ success: false, error: err.message });
          }
        });
      } catch (error) {
        resolve({ success: false, error: error instanceof Error ? error.message : 'Configuration error' });
      }
    });
  },

  // Reset password with verification code
  async resetPassword({ email, code, newPassword }: ResetPasswordParams): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!canUseAWS()) {
        resolve({ success: false, error: 'Service not available in this environment' });
        return;
      }

      try {
        const pool = getUserPool();
        const userData = {
          Username: email,
          Pool: pool
        };

        const cognitoUser = new CognitoUser(userData);
        cognitoUser.confirmPassword(code, newPassword, {
          onSuccess: () => {
            resolve({ success: true });
          },
          onFailure: (err: Error) => {
            resolve({ success: false, error: err.message });
          }
        });
      } catch (error) {
        resolve({ success: false, error: error instanceof Error ? error.message : 'Configuration error' });
      }
    });
  },

  // Sign out user
  async signOut(): Promise<void> {
    if (!canUseAWS()) {
      return;
    }

    try {
      const pool = getUserPool();
      const cognitoUser = pool.getCurrentUser();
      if (cognitoUser) {
        cognitoUser.signOut();
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },

  // Get current session
  async getCurrentSession(): Promise<{ success: boolean; token?: string; error?: string }> {
    return new Promise((resolve) => {
      if (!canUseAWS()) {
        resolve({ success: false, error: 'Service not available in this environment' });
        return;
      }

      try {
        const pool = getUserPool();
        const cognitoUser = pool.getCurrentUser();
        if (!cognitoUser) {
          resolve({ success: false, error: 'No user found' });
          return;
        }

        cognitoUser.getSession((err: Error | null, session: any) => {
          if (err) {
            resolve({ success: false, error: err.message });
            return;
          }
          if (!session.isValid()) {
            resolve({ success: false, error: 'Invalid session' });
            return;
          }
          const token = session.getIdToken().getJwtToken();
          resolve({ success: true, token });
        });
      } catch (error) {
        resolve({ success: false, error: error instanceof Error ? error.message : 'Configuration error' });
      }
    });
  },

  // Check if user session is valid
  async isSessionValid(): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!canUseAWS()) {
        resolve({ success: false, error: 'Service not available in this environment' });
        return;
      }

      try {
        const pool = getUserPool();
        const cognitoUser = pool.getCurrentUser();
        if (!cognitoUser) {
          resolve({ success: false, error: 'No user found' });
          return;
        }

        cognitoUser.getSession((err: Error | null, session: any) => {
          if (err) {
            resolve({ success: false, error: err.message });
            return;
          }
          if (!session || !session.isValid()) {
            resolve({ success: false, error: 'Invalid or expired session' });
            return;
          }
          resolve({ success: true });
        });
      } catch (error) {
        resolve({ success: false, error: error instanceof Error ? error.message : 'Configuration error' });
      }
    });
  },

  // Get user attributes from Cognito
  async getUserAttributes(): Promise<{ 
    success: boolean; 
    attributes?: {
      email: string;
      given_name: string;
      family_name: string;
      phone_number: string;
      su?: string;
      plan?: string;
    }; 
    error?: string 
  }> {
    return new Promise((resolve) => {
      if (!canUseAWS()) {
        console.error('❌ AWS not available in this environment');
        resolve({ success: false, error: 'Service not available in this environment' });
        return;
      }

      try {
        console.log('🔍 Getting user pool...');
        const pool = getUserPool();
        console.log('🔍 Getting current user...');
        const cognitoUser = pool.getCurrentUser();
        
        if (!cognitoUser) {
          console.error('❌ No current user found');
          resolve({ success: false, error: 'No user found' });
          return;
        }

        // First check if the session is valid
        console.log('🔍 Checking session validity...');
        cognitoUser.getSession((sessionErr: Error | null, session: any) => {
          if (sessionErr) {
            console.error('❌ Session error:', sessionErr);
            resolve({ success: false, error: 'Session error: ' + sessionErr.message });
            return;
          }
          
          if (!session || !session.isValid()) {
            console.error('❌ Invalid or expired session');
            resolve({ success: false, error: 'Invalid or expired session' });
            return;
          }

          console.log('✅ Session is valid, getting attributes...');
          cognitoUser.getUserAttributes((err: Error | undefined, attributes: any) => {
            if (err) {
              console.error('❌ Error getting user attributes:', err);
              resolve({ success: false, error: err.message });
              return;
            }

            if (!attributes) {
              console.error('❌ No attributes found');
              resolve({ success: false, error: 'No attributes found' });
              return;
            }

            console.log('📋 Raw attributes from Cognito:', attributes);

            // Extract the required attributes
            const userAttributes: any = {};
            attributes.forEach((attr: any) => {
              const name = attr.getName();
              const value = attr.getValue();
              userAttributes[name] = value;
              console.log(`🔍 Attribute: ${name} = ${value}`);
            });

            console.log('📊 Processed userAttributes:', userAttributes);
            console.log('🔍 Looking for custom:su:', userAttributes['custom:su']);
            console.log('🔍 Looking for custom:plan:', userAttributes['custom:plan']);
            console.log('🔍 All attribute names:', Object.keys(userAttributes));

            const result = {
              email: userAttributes.email || '',
              given_name: userAttributes.given_name || '',
              family_name: userAttributes.family_name || '',
              phone_number: userAttributes.phone_number || '',
              su: userAttributes['custom:su'] || '',
              plan: userAttributes['custom:plan'] || ''
            };

            console.log('result => userAttributes',result);

            resolve({ success: true, attributes: result });
          });
        });
      } catch (error) {
        console.error('❌ Exception in getUserAttributes:', error);
        resolve({ success: false, error: error instanceof Error ? error.message : 'Configuration error' });
      }
    });
  }
}; 