import { renderHook, waitFor, act } from '@testing-library/react-native';

import { useModes, useModesWithVisibility, useCustomModes, useModeMethod, isCustomMode, getModeId } from '@/hooks/useModes';
import { addCustomMode, hideMode, BUILT_IN_MODES, CustomMode } from '@/utils/phraseStorage';
import { clearStorage } from '../helpers/storage-helpers';

beforeEach(async () => {
    await clearStorage();
});

// ============================================
// useModes
// ============================================

describe('useModes', () => {
    it('starts in loading state', () => {
        const { result } = renderHook(() => useModes());
        expect(result.current.isLoading).toBe(true);
    });

    it('resolves with visible modes (excludes sadness by default)', async () => {
        const { result } = renderHook(() => useModes());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        const modeIds = result.current.modes.map(m => isCustomMode(m) ? m.id : m);
        expect(modeIds).not.toContain('sadness');
        expect(modeIds).toContain('panic');
        expect(modeIds).toContain('grounding');
    });

    it('includes custom modes sorted by createdAt', async () => {
        await addCustomMode('Second', 'random');
        // Small delay to ensure different createdAt
        await new Promise(r => setTimeout(r, 10));
        await addCustomMode('First', 'sit');

        const { result } = renderHook(() => useModes());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        const customModes = result.current.modes.filter(isCustomMode);
        expect(customModes).toHaveLength(2);
        expect(customModes[0].name).toBe('Second');
        expect(customModes[1].name).toBe('First');
    });

    it('refetch() picks up changes', async () => {
        const { result } = renderHook(() => useModes());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        const initialCount = result.current.modes.length;

        await addCustomMode('New Mode', 'random');
        await act(async () => {
            await result.current.refetch();
        });

        await waitFor(() => expect(result.current.modes.length).toBe(initialCount + 1));
    });
});

// ============================================
// useModesWithVisibility
// ============================================

describe('useModesWithVisibility', () => {
    it('returns all modes with isHidden and isCustom flags', async () => {
        const { result } = renderHook(() => useModesWithVisibility());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        // Should include all built-in modes
        expect(result.current.modes.length).toBeGreaterThanOrEqual(BUILT_IN_MODES.length);

        const panicMode = result.current.modes.find(m => !m.isCustom && m.mode === 'panic');
        expect(panicMode).toBeDefined();
        expect(panicMode?.isHidden).toBe(false);
        expect(panicMode?.isCustom).toBe(false);
    });

    it('marks sadness as hidden by default', async () => {
        const { result } = renderHook(() => useModesWithVisibility());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        const sadnessMode = result.current.modes.find(m => !m.isCustom && m.mode === 'sadness');
        expect(sadnessMode?.isHidden).toBe(true);
    });

    it('includes custom modes with correct flags', async () => {
        const customMode = await addCustomMode('Custom', 'random');
        await hideMode(customMode.id);

        const { result } = renderHook(() => useModesWithVisibility());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        const found = result.current.modes.find(m => m.isCustom && (m.mode as CustomMode).id === customMode.id);
        expect(found).toBeDefined();
        expect(found?.isHidden).toBe(true);
        expect(found?.isCustom).toBe(true);
    });
});

// ============================================
// useCustomModes
// ============================================

describe('useCustomModes', () => {
    it('returns empty array initially', async () => {
        const { result } = renderHook(() => useCustomModes());

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.customModes).toEqual([]);
    });

    it('returns sorted custom modes', async () => {
        await addCustomMode('B', 'random');
        await new Promise(r => setTimeout(r, 10));
        await addCustomMode('A', 'sit');

        const { result } = renderHook(() => useCustomModes());

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.customModes).toHaveLength(2);
        expect(result.current.customModes[0].name).toBe('B');
        expect(result.current.customModes[1].name).toBe('A');
    });

    it('refetch() picks up new modes', async () => {
        const { result } = renderHook(() => useCustomModes());

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.customModes).toHaveLength(0);

        await addCustomMode('New', 'random');
        await act(async () => {
            await result.current.refetch();
        });

        await waitFor(() => expect(result.current.customModes).toHaveLength(1));
    });
});

// ============================================
// useModeMethod
// ============================================

describe('useModeMethod', () => {
    it('returns sit for panic mode', async () => {
        const { result } = renderHook(() => useModeMethod('panic'));

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.method).toBe('sit');
    });

    it('returns random for grounding mode', async () => {
        const { result } = renderHook(() => useModeMethod('grounding'));

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.method).toBe('random');
    });

    it('returns stored method for custom modes', async () => {
        const mode = await addCustomMode('Custom', 'seeAll');

        const { result } = renderHook(() => useModeMethod(mode.id));

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.method).toBe('seeAll');
    });
});

// ============================================
// Helper functions
// ============================================

describe('helper functions', () => {
    it('isCustomMode distinguishes built-in from custom', () => {
        expect(isCustomMode('panic')).toBe(false);
        expect(isCustomMode({ id: 'custom_1', name: 'Test', method: 'sit', createdAt: 1 })).toBe(true);
    });

    it('getModeId returns correct ID for both types', () => {
        expect(getModeId('panic')).toBe('panic');
        expect(getModeId({ id: 'custom_1', name: 'Test', method: 'sit', createdAt: 1 })).toBe('custom_1');
    });
});
