import '@testing-library/jest-dom';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    };
  },
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme() {
    return {
      theme: 'light',
      setTheme: jest.fn(),
      resolvedTheme: 'light',
      themes: ['light', 'dark'],
      systemTheme: 'light',
    };
  },
  ThemeProvider: ({ children }) => children,
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Global fetch mock
global.fetch = jest.fn();

// Mock AWS Cognito configuration first
process.env.NEXT_PUBLIC_AWS_REGION = 'us-east-1';
process.env.NEXT_PUBLIC_AWS_USER_POOL_ID = 'us-east-1_test123';
process.env.NEXT_PUBLIC_AWS_CLIENT_ID = 'test-client-id';

// Mock AWS Cognito
jest.mock('amazon-cognito-identity-js', () => ({
  CognitoUserPool: jest.fn().mockImplementation(() => ({
    signUp: jest.fn((email, password, attributes, validationData, callback) => {
      setTimeout(() => callback(null, { user: { getUsername: () => email } }), 0);
    }),
    getCurrentUser: jest.fn(),
  })),
  CognitoUser: jest.fn().mockImplementation(() => ({
    authenticateUser: jest.fn((authDetails, callbacks) => {
      setTimeout(() => callbacks.onSuccess({
        getIdToken: () => ({ getJwtToken: () => 'mock-token' })
      }), 0);
    }),
    signOut: jest.fn(),
    confirmRegistration: jest.fn((code, forceAliasCreation, callback) => {
      setTimeout(() => callback(null, 'SUCCESS'), 0);
    }),
    forgotPassword: jest.fn((callbacks) => {
      setTimeout(() => callbacks.onSuccess(), 0);
    }),
    confirmPassword: jest.fn((code, newPassword, callbacks) => {
      setTimeout(() => callbacks.onSuccess(), 0);
    }),
    resendConfirmationCode: jest.fn((callback) => {
      setTimeout(() => callback(null, 'SUCCESS'), 0);
    }),
  })),
  AuthenticationDetails: jest.fn().mockImplementation(() => ({})),
  CognitoUserAttribute: jest.fn().mockImplementation(() => ({})),
}));

// Mock the cognito service directly
jest.mock('./src/lib/aws/cognito', () => ({
  authService: {
    signUp: jest.fn().mockResolvedValue({ success: true }),
    signIn: jest.fn().mockResolvedValue({ success: true, token: 'mock-token' }),
    confirmSignUp: jest.fn().mockResolvedValue({ success: true }),
    forgotPassword: jest.fn().mockResolvedValue({ success: true }),
    resetPassword: jest.fn().mockResolvedValue({ success: true }),
    resendConfirmationCode: jest.fn().mockResolvedValue({ success: true }),
    signOut: jest.fn().mockResolvedValue(undefined),
    getCurrentSession: jest.fn().mockResolvedValue({ success: false, error: 'No user found' }),
  },
}));

// Window.matchMedia mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Console error suppression for expected warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
}); 