import { CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserAttribute, ISignUpResult } from 'amazon-cognito-identity-js';

// AWS Cognito configuration
const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID || '',
  ClientId: process.env.NEXT_PUBLIC_AWS_CLIENT_ID || '',
  Region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'
};

// Validate required configuration
if (!poolData.UserPoolId || !poolData.ClientId) {
  throw new Error('AWS Cognito configuration is missing. Please check your environment variables.');
}

const userPool = new CognitoUserPool(poolData);

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

      userPool.signUp(email, password, attributeList, [], (err: Error | undefined, result: ISignUpResult | undefined) => {
        if (err) {
          resolve({ success: false, error: err.message });
          return;
        }
        resolve({ success: true });
      });
    });
  },

  // Confirm user registration with verification code
  async confirmSignUp(email: string, code: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const userData = {
        Username: email,
        Pool: userPool
      };

      const cognitoUser = new CognitoUser(userData);
      cognitoUser.confirmRegistration(code, true, (err: Error | undefined, result: string) => {
        if (err) {
          resolve({ success: false, error: err.message });
          return;
        }
        resolve({ success: true });
      });
    });
  },

  // Resend verification code
  async resendConfirmationCode(email: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const userData = {
        Username: email,
        Pool: userPool
      };

      const cognitoUser = new CognitoUser(userData);
      cognitoUser.resendConfirmationCode((err: Error | undefined, result: string) => {
        if (err) {
          resolve({ success: false, error: err.message });
          return;
        }
        resolve({ success: true });
      });
    });
  },

  // Sign in user
  async signIn({ email, password }: SignInParams): Promise<{ success: boolean; token?: string; error?: string }> {
    return new Promise((resolve) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password
      });

      const userData = {
        Username: email,
        Pool: userPool
      };

      const cognitoUser = new CognitoUser(userData);
      
      // Use ALLOW_USER_PASSWORD_AUTH flow
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          const token = result.getIdToken().getJwtToken();
          resolve({ success: true, token });
        },
        onFailure: (err: Error) => {
          console.error('Authentication error:', err);
          resolve({ success: false, error: err.message });
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          resolve({ success: false, error: 'Se requiere establecer una nueva contraseña' });
        }
      });
    });
  },

  // Request password reset
  async forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const userData = {
        Username: email,
        Pool: userPool
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
    });
  },

  // Reset password with verification code
  async resetPassword({ email, code, newPassword }: ResetPasswordParams): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const userData = {
        Username: email,
        Pool: userPool
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
    });
  },

  // Sign out user
  async signOut(): Promise<void> {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
  },

  // Get current session
  async getCurrentSession(): Promise<{ success: boolean; token?: string; error?: string }> {
    return new Promise((resolve) => {
      const cognitoUser = userPool.getCurrentUser();
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
    });
  }
}; 