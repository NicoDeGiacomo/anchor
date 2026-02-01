import { useCallback, useEffect, useState } from 'react';

import {
    ALL_MODES,
    getHiddenModes,
    getVisibleModes,
    Mode,
} from '@/utils/phraseStorage';

export interface ModeWithVisibility {
    mode: Mode;
    isHidden: boolean;
}

interface UseModesResult {
    modes: Mode[];
    isLoading: boolean;
    refetch: () => Promise<void>;
}

interface UseModesWithVisibilityResult {
    modes: ModeWithVisibility[];
    isLoading: boolean;
    refetch: () => Promise<void>;
}

/**
 * Hook to load visible modes for display (excluding hidden)
 * Use this for the home screen
 */
export function useModes(): UseModesResult {
    const [modes, setModes] = useState<Mode[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadModes = useCallback(async () => {
        setIsLoading(true);
        
        try {
            const visibleModes = await getVisibleModes();
            setModes(visibleModes);
        } catch (error) {
            console.warn('Failed to load modes:', error);
            // Fallback to all modes if loading fails
            setModes(ALL_MODES);
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
            const hiddenModes = await getHiddenModes();
            
            const modesWithVisibility: ModeWithVisibility[] = ALL_MODES.map(mode => ({
                mode,
                isHidden: hiddenModes.includes(mode),
            }));
            
            setModes(modesWithVisibility);
        } catch (error) {
            console.warn('Failed to load modes:', error);
            // Fallback to all modes visible if loading fails
            setModes(ALL_MODES.map(mode => ({ mode, isHidden: false })));
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
