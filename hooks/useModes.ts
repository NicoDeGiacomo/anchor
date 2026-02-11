import { useCallback, useEffect, useState } from 'react';

import {
    BUILT_IN_MODES,
    BuiltInMode,
    CustomMode,
    getCustomModes,
    getHiddenModes,
    getModeMethod,
    getVisibleCustomModes,
    getVisibleModes,
    ModeMethod,
} from '@/utils/phraseStorage';

// A display mode can be either a built-in mode ID or a custom mode object
export type DisplayMode = BuiltInMode | CustomMode;

export interface ModeWithVisibility {
    mode: DisplayMode;
    isHidden: boolean;
    isCustom: boolean;
}

interface UseModesResult {
    modes: DisplayMode[];
    isLoading: boolean;
    refetch: () => Promise<void>;
}

interface UseModesWithVisibilityResult {
    modes: ModeWithVisibility[];
    isLoading: boolean;
    refetch: () => Promise<void>;
}

interface UseCustomModesResult {
    customModes: CustomMode[];
    isLoading: boolean;
    refetch: () => Promise<void>;
}

/**
 * Helper to check if a display mode is a custom mode
 */
export function isCustomMode(mode: DisplayMode): mode is CustomMode {
    return typeof mode === 'object' && 'id' in mode && 'name' in mode;
}

/**
 * Helper to get the mode ID (works for both built-in and custom modes)
 */
export function getModeId(mode: DisplayMode): string {
    return isCustomMode(mode) ? mode.id : mode;
}

/**
 * Hook to load visible modes for display (excluding hidden)
 * Use this for the home screen
 */
export function useModes(): UseModesResult {
    const [modes, setModes] = useState<DisplayMode[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadModes = useCallback(async () => {
        setIsLoading(true);
        
        try {
            // Load visible built-in modes and visible custom modes
            const [visibleBuiltIn, visibleCustom] = await Promise.all([
                getVisibleModes(),
                getVisibleCustomModes(),
            ]);
            
            // Combine: built-in modes first, then custom modes (sorted by creation date)
            const sortedCustom = [...visibleCustom].sort((a, b) => a.createdAt - b.createdAt);
            setModes([...visibleBuiltIn, ...sortedCustom]);
        } catch (error) {
            console.warn('Failed to load modes:', error);
            // Fallback to built-in modes if loading fails
            setModes([...BUILT_IN_MODES]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadModes();
    }, [loadModes]);

    return {
        modes,
        isLoading,
        refetch: loadModes,
    };
}

/**
 * Hook to load all modes with visibility information (for settings)
 * Includes both visible and hidden modes
 */
export function useModesWithVisibility(): UseModesWithVisibilityResult {
    const [modes, setModes] = useState<ModeWithVisibility[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadModes = useCallback(async () => {
        setIsLoading(true);
        
        try {
            const [hiddenModes, customModes] = await Promise.all([
                getHiddenModes(),
                getCustomModes(),
            ]);
            
            // Built-in modes with visibility
            const builtInWithVisibility: ModeWithVisibility[] = BUILT_IN_MODES.map(mode => ({
                mode,
                isHidden: hiddenModes.includes(mode),
                isCustom: false,
            }));
            
            // Custom modes with visibility (sorted by creation date)
            const sortedCustom = [...customModes].sort((a, b) => a.createdAt - b.createdAt);
            const customWithVisibility: ModeWithVisibility[] = sortedCustom.map(mode => ({
                mode,
                isHidden: hiddenModes.includes(mode.id),
                isCustom: true,
            }));
            
            setModes([...builtInWithVisibility, ...customWithVisibility]);
        } catch (error) {
            console.warn('Failed to load modes:', error);
            // Fallback to built-in modes visible if loading fails
            setModes(BUILT_IN_MODES.map(mode => ({ mode, isHidden: false, isCustom: false })));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadModes();
    }, [loadModes]);

    return {
        modes,
        isLoading,
        refetch: loadModes,
    };
}

/**
 * Hook to load custom modes only (for management in settings)
 */
export function useCustomModes(): UseCustomModesResult {
    const [customModes, setCustomModes] = useState<CustomMode[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadCustomModes = useCallback(async () => {
        setIsLoading(true);
        
        try {
            const modes = await getCustomModes();
            // Sort by creation date
            setCustomModes([...modes].sort((a, b) => a.createdAt - b.createdAt));
        } catch (error) {
            console.warn('Failed to load custom modes:', error);
            setCustomModes([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCustomModes();
    }, [loadCustomModes]);

    return {
        customModes,
        isLoading,
        refetch: loadCustomModes,
    };
}

interface UseModeMethodResult {
    method: ModeMethod;
    isLoading: boolean;
}

/**
 * Hook to get the method for a specific mode (built-in or custom)
 */
export function useModeMethod(modeId: string): UseModeMethodResult {
    const [method, setMethod] = useState<ModeMethod>('sit');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);

        getModeMethod(modeId).then(result => {
            if (!cancelled) {
                setMethod(result);
                setIsLoading(false);
            }
        });

        return () => { cancelled = true; };
    }, [modeId]);

    return { method, isLoading };
}
