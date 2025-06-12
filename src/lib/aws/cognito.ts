import { CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserAttribute, ISignUpResult } from 'amazon-cognito-identity-js';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// AWS Cognito configuration
const getPoolData = () => {
  // During build time or server-side, provide defaults to prevent errors
  const userPoolId = process.env.AWS_USER_POOL_ID || 'us-east-2_Fpda5LMX0';
  const clientId = process.env.AWS_POOL_CLIENT_ID || '5kvmdd29oj2lpnq9b4j60gfe69';
  const region = process.env.AWS_REGION || 'us-east-2';

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
  name: string;
  phone: string;
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
  async signUp({ email, password, name, phone }: SignUpParams): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!canUseAWS()) {
        resolve({ success: false, error: 'Service not available in this environment' });
        return;
      }

      try {
        const pool = getUserPool();
        const attributeList = [
          new CognitoUserAttribute({
            Name: 'name',
            Value: name
          }),
          new CognitoUserAttribute({
            Name: 'email',
            Value: email
          }),
          new CognitoUserAttribute({
            Name: 'phone_number',
            Value: phone
          })
        ];

        pool.signUp(email, password, attributeList, [], (err: Error | undefined, result: ISignUpResult | undefined) => {
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
        const pool = getUserPool();
        const authenticationDetails = new AuthenticationDetails({
          Username: email,
          Password: password
        });

        const userData = {
          Username: email,
          Pool: pool
        };

        const cognitoUser = new CognitoUser(userData);
        
        // Use ALLOW_USER_PASSWORD_AUTH flow by setting auth flow type
        cognitoUser.setAuthenticationFlowType('USER_PASSWORD_AUTH');
        cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: (result) => {
            const token = result.getIdToken().getJwtToken();
            console.log('✅ Login successful');
            resolve({ success: true, token });
          },
          onFailure: (err: Error) => {
            console.error('🔴 Authentication error:', err);
            console.log('📧 Email used:', email);
            
            // Provide more specific error messages
            let errorMessage = err.message;
            if (err.message.includes('NotAuthorizedException')) {
              if (err.message.includes('Incorrect username or password')) {
                errorMessage = 'Email o contraseña incorrectos. ¿Ya te registraste y confirmaste tu email?';
              }
            } else if (err.message.includes('UserNotConfirmedException')) {
              errorMessage = 'Debes confirmar tu email antes de iniciar sesión. Revisa tu correo.';
            }
            
            resolve({ success: false, error: errorMessage });
          },
          newPasswordRequired: (userAttributes, requiredAttributes) => {
            resolve({ success: false, error: 'Se requiere establecer una nueva contraseña' });
          }
        });
      } catch (error) {
        resolve({ success: false, error: error instanceof Error ? error.message : 'Configuration error' });
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
  }
}; 