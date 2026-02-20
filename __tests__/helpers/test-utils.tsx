import { render, renderHook, RenderOptions, RenderHookOptions } from '@testing-library/react-native';
import React, { ReactElement } from 'react';

import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

function AllProviders({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <LanguageProvider>
                {children}
            </LanguageProvider>
        </ThemeProvider>
    );
}

/**
 * Render a component wrapped in ThemeProvider + LanguageProvider
 */
export function renderWithProviders(
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) {
    return render(ui, { wrapper: AllProviders, ...options });
}

/**
 * Render a hook wrapped in ThemeProvider + LanguageProvider
 */
export function renderHookWithProviders<Result, Props>(
    hook: (props: Props) => Result,
    options?: Omit<RenderHookOptions<Props>, 'wrapper'>
) {
    return renderHook(hook, { wrapper: AllProviders, ...options });
}

// Re-export everything from @testing-library/react-native
export * from '@testing-library/react-native';
