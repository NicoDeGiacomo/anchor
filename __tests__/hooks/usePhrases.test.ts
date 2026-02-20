import { waitFor, act } from '@testing-library/react-native';

import { usePhrases, useFlatPhrases, usePhrasesWithSource, useFlatPhrasesWithSource } from '@/hooks/usePhrases';
import { addUserPhrase, hideBuiltInPhrase } from '@/utils/phraseStorage';
import { clearStorage } from '../helpers/storage-helpers';
import { renderHookWithProviders } from '../helpers/test-utils';

beforeEach(async () => {
    await clearStorage();
});

// ============================================
// usePhrases (SIT phased)
// ============================================

describe('usePhrases', () => {
    it('loads panic phrases in English', async () => {
        const { result } = renderHookWithProviders(() => usePhrases('panic'));

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.phrases.preparation.length).toBeGreaterThan(0);
        expect(result.current.phrases.confrontation.length).toBeGreaterThan(0);
        expect(result.current.phrases.reinforcement.length).toBeGreaterThan(0);
        expect(result.current.error).toBeNull();
    });

    it('filters hidden phrases', async () => {
        // First load to discover phrase IDs
        const { result: initial } = renderHookWithProviders(() => usePhrases('panic'));
        await waitFor(() => expect(initial.current.isLoading).toBe(false));

        const firstPrepId = initial.current.phrases.preparation[0].id;
        const totalPrep = initial.current.phrases.preparation.length;

        await hideBuiltInPhrase('panic', 'en', firstPrepId);

        const { result } = renderHookWithProviders(() => usePhrases('panic'));
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.phrases.preparation.length).toBe(totalPrep - 1);
    });

    it('includes user phrases', async () => {
        await addUserPhrase('panic', 'en', 'preparation', 'My custom phrase');

        const { result } = renderHookWithProviders(() => usePhrases('panic'));
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        const texts = result.current.phrases.preparation.map(p => p.text);
        expect(texts).toContain('My custom phrase');
    });

    it('refetch() reloads data', async () => {
        const { result } = renderHookWithProviders(() => usePhrases('panic'));
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        const initialCount = result.current.phrases.preparation.length;

        await addUserPhrase('panic', 'en', 'preparation', 'Added later');
        await act(async () => {
            await result.current.refetch();
        });

        await waitFor(() =>
            expect(result.current.phrases.preparation.length).toBe(initialCount + 1)
        );
    });
});

// ============================================
// useFlatPhrases (random/seeAll modes)
// ============================================

describe('useFlatPhrases', () => {
    it('loads grounding phrases', async () => {
        const { result } = renderHookWithProviders(() => useFlatPhrases('grounding'));

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.phrases.length).toBeGreaterThan(0);
        expect(result.current.error).toBeNull();
    });

    it('filters hidden and appends user phrases', async () => {
        const { result: initial } = renderHookWithProviders(() => useFlatPhrases('grounding'));
        await waitFor(() => expect(initial.current.isLoading).toBe(false));

        const firstId = initial.current.phrases[0].id;
        const totalCount = initial.current.phrases.length;

        await hideBuiltInPhrase('grounding', 'en', firstId);
        await addUserPhrase('grounding', 'en', 'general', 'User grounding');

        const { result } = renderHookWithProviders(() => useFlatPhrases('grounding'));
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        // -1 hidden + 1 user = same total
        expect(result.current.phrases.length).toBe(totalCount);
    });

    it('returns empty for custom modes with no content', async () => {
        const { result } = renderHookWithProviders(() => useFlatPhrases('custom_123'));

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.phrases).toEqual([]);
    });
});

// ============================================
// usePhrasesWithSource
// ============================================

describe('usePhrasesWithSource', () => {
    it('marks built-in phrases as isUserAdded: false', async () => {
        const { result } = renderHookWithProviders(() => usePhrasesWithSource('panic'));

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        const builtIn = result.current.phrases.preparation.filter(p => !p.isUserAdded);
        expect(builtIn.length).toBeGreaterThan(0);
    });

    it('marks user phrases as isUserAdded: true', async () => {
        await addUserPhrase('panic', 'en', 'preparation', 'User phrase');

        const { result } = renderHookWithProviders(() => usePhrasesWithSource('panic'));
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        const userPhrases = result.current.phrases.preparation.filter(p => p.isUserAdded);
        expect(userPhrases.length).toBe(1);
        expect(userPhrases[0].text).toBe('User phrase');
    });

    it('marks hidden phrases with isHidden: true', async () => {
        const { result: initial } = renderHookWithProviders(() => usePhrasesWithSource('panic'));
        await waitFor(() => expect(initial.current.isLoading).toBe(false));

        const firstId = initial.current.phrases.preparation[0].id;
        await hideBuiltInPhrase('panic', 'en', firstId);

        const { result } = renderHookWithProviders(() => usePhrasesWithSource('panic'));
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        const hidden = result.current.phrases.preparation.find(p => p.id === firstId);
        expect(hidden?.isHidden).toBe(true);
    });

    it('sets isCustomMode flag correctly', async () => {
        const { result: builtIn } = renderHookWithProviders(() => usePhrasesWithSource('panic'));
        await waitFor(() => expect(builtIn.current.isLoading).toBe(false));
        expect(builtIn.current.isCustomMode).toBe(false);

        const { result: custom } = renderHookWithProviders(() => usePhrasesWithSource('custom_123'));
        await waitFor(() => expect(custom.current.isLoading).toBe(false));
        expect(custom.current.isCustomMode).toBe(true);
    });
});

// ============================================
// useFlatPhrasesWithSource
// ============================================

describe('useFlatPhrasesWithSource', () => {
    it('combines built-in and user phrases with correct source flags', async () => {
        await addUserPhrase('grounding', 'en', 'general', 'User grounding');

        const { result } = renderHookWithProviders(() => useFlatPhrasesWithSource('grounding'));
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        const builtIn = result.current.phrases.filter(p => !p.isUserAdded);
        const user = result.current.phrases.filter(p => p.isUserAdded);

        expect(builtIn.length).toBeGreaterThan(0);
        expect(user.length).toBe(1);
        expect(user[0].text).toBe('User grounding');
    });

    it('marks hidden phrases', async () => {
        const { result: initial } = renderHookWithProviders(() => useFlatPhrasesWithSource('grounding'));
        await waitFor(() => expect(initial.current.isLoading).toBe(false));

        const firstId = initial.current.phrases[0].id;
        await hideBuiltInPhrase('grounding', 'en', firstId);

        const { result } = renderHookWithProviders(() => useFlatPhrasesWithSource('grounding'));
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        const hidden = result.current.phrases.find(p => p.id === firstId);
        expect(hidden?.isHidden).toBe(true);
    });

    it('sets isCustomMode flag correctly', async () => {
        const { result } = renderHookWithProviders(() => useFlatPhrasesWithSource('grounding'));
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.isCustomMode).toBe(false);

        const { result: custom } = renderHookWithProviders(() => useFlatPhrasesWithSource('custom_123'));
        await waitFor(() => expect(custom.current.isLoading).toBe(false));
        expect(custom.current.isCustomMode).toBe(true);
    });
});
