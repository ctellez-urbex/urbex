import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/components/ui/theme-provider'

// Mock AWS Cognito
jest.mock('@/lib/aws/cognito', () => ({
  authService: {
    signIn: jest.fn().mockResolvedValue({ success: true, token: 'mock-token' }),
    signUp: jest.fn().mockResolvedValue({ success: true }),
    signOut: jest.fn().mockResolvedValue(undefined),
    getCurrentSession: jest.fn().mockResolvedValue({ success: false }),
    getUserAttributes: jest.fn().mockResolvedValue({ 
      success: true, 
      attributes: {
        email: 'test@example.com',
        given_name: 'Test',
        family_name: 'User',
        custom_su: '12345',
        custom_plan: 'monthly'
      }
    })
  }
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

interface AllTheProvidersProps {
  children: React.ReactNode
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  wrapper?: React.ComponentType<{ children: React.ReactNode }>
}

const customRender = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { wrapper: CustomWrapper, ...renderOptions } = options

  const Wrapper = CustomWrapper || AllTheProviders

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render } 