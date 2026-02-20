import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    getUserPhrases,
    addUserPhrase,
    removeUserPhrase,
    saveUserPhrases,
    getHiddenPhrases,
    hideBuiltInPhrase,
    unhideBuiltInPhrase,
    getActivePhrases,
    getActiveFlatPhrases,
    getHiddenModes,
    hideMode,
    unhideMode,
    getVisibleModes,
    getCustomModes,
    addCustomMode,
    updateCustomMode,
    deleteCustomMode,
    getCustomModeById,
    getVisibleCustomModes,
    getModeMethod,
    resetAllToDefaults,
    hasSeenNavigationHint,
    markNavigationHintSeen,
    BUILT_IN_MODES,
    BUILT_IN_MODE_METHODS,
    PhasedPhrases,
    Phrase,
} from '@/utils/phraseStorage';
import { clearStorage, seedStorage } from '../helpers/storage-helpers';

beforeEach(async () => {
    await clearStorage();
});

// ============================================
// User Phrase CRUD
// ============================================

describe('User Phrase CRUD', () => {
    it('getUserPhrases returns empty array when no phrases stored', async () => {
        const phrases = await getUserPhrases('panic', 'en', 'preparation');
        expect(phrases).toEqual([]);
    });

    it('addUserPhrase stores and returns phrase with ID', async () => {
        const phrase = await addUserPhrase('panic', 'en', 'preparation', 'Stay calm');
        expect(phrase).toMatchObject({ text: 'Stay calm' });
        expect(phrase.id).toMatch(/^user_/);

        const stored = await getUserPhrases('panic', 'en', 'preparation');
        expect(stored).toHaveLength(1);
        expect(stored[0].text).toBe('Stay calm');
    });

    it('addUserPhrase appends without overwriting existing phrases', async () => {
        await addUserPhrase('panic', 'en', 'preparation', 'First');
        await addUserPhrase('panic', 'en', 'preparation', 'Second');

        const stored = await getUserPhrases('panic', 'en', 'preparation');
        expect(stored).toHaveLength(2);
        expect(stored[0].text).toBe('First');
        expect(stored[1].text).toBe('Second');
    });

    it('addUserPhrase stores subphrase when provided', async () => {
        const phrase = await addUserPhrase('panic', 'en', 'preparation', 'Main', 'Sub');
        expect(phrase.subphrase).toBe('Sub');
    });

    it('removeUserPhrase removes phrase by ID', async () => {
        const phrase = await addUserPhrase('panic', 'en', 'preparation', 'Remove me');
        await removeUserPhrase('panic', 'en', 'preparation', phrase.id);

        const stored = await getUserPhrases('panic', 'en', 'preparation');
        expect(stored).toHaveLength(0);
    });

    it('removeUserPhrase is a no-op for missing ID', async () => {
        await addUserPhrase('panic', 'en', 'preparation', 'Keep me');
        await removeUserPhrase('panic', 'en', 'preparation', 'nonexistent_id');

        const stored = await getUserPhrases('panic', 'en', 'preparation');
        expect(stored).toHaveLength(1);
    });

    it('saveUserPhrases overwrites existing phrases', async () => {
        await addUserPhrase('panic', 'en', 'preparation', 'Old');

        const newPhrases = [{ id: 'user_new', text: 'New' }];
        await saveUserPhrases('panic', 'en', 'preparation', newPhrases);

        const stored = await getUserPhrases('panic', 'en', 'preparation');
        expect(stored).toEqual(newPhrases);
    });

    it('getUserPhrases returns empty array on storage error', async () => {
        jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('fail'));
        const phrases = await getUserPhrases('panic', 'en', 'preparation');
        expect(phrases).toEqual([]);
    });
});

// ============================================
// Hidden Phrases
// ============================================

describe('Hidden Phrases', () => {
    it('getHiddenPhrases returns empty array when none hidden', async () => {
        const hidden = await getHiddenPhrases('panic', 'en');
        expect(hidden).toEqual([]);
    });

    it('hideBuiltInPhrase adds phrase ID to hidden list', async () => {
        await hideBuiltInPhrase('panic', 'en', 'prep1');
        const hidden = await getHiddenPhrases('panic', 'en');
        expect(hidden).toContain('prep1');
    });

    it('hideBuiltInPhrase is idempotent', async () => {
        await hideBuiltInPhrase('panic', 'en', 'prep1');
        await hideBuiltInPhrase('panic', 'en', 'prep1');
        const hidden = await getHiddenPhrases('panic', 'en');
        expect(hidden.filter(id => id === 'prep1')).toHaveLength(1);
    });

    it('unhideBuiltInPhrase removes phrase ID from hidden list', async () => {
        await hideBuiltInPhrase('panic', 'en', 'prep1');
        await unhideBuiltInPhrase('panic', 'en', 'prep1');
        const hidden = await getHiddenPhrases('panic', 'en');
        expect(hidden).not.toContain('prep1');
    });

    it('unhideBuiltInPhrase is a no-op for missing ID', async () => {
        await hideBuiltInPhrase('panic', 'en', 'prep1');
        await unhideBuiltInPhrase('panic', 'en', 'nonexistent');
        const hidden = await getHiddenPhrases('panic', 'en');
        expect(hidden).toContain('prep1');
    });
});

// ============================================
// Active Phrases
// ============================================

describe('Active Phrases', () => {
    const builtIn: PhasedPhrases = {
        preparation: [{ id: 'prep1', text: 'Prepare' }, { id: 'prep2', text: 'Ready' }],
        confrontation: [{ id: 'conf1', text: 'Face it' }],
        reinforcement: [{ id: 'reinf1', text: 'Well done' }],
    };

    it('getActivePhrases returns all built-in when none hidden', async () => {
        const active = await getActivePhrases('panic', 'en', builtIn);
        expect(active.preparation).toHaveLength(2);
        expect(active.confrontation).toHaveLength(1);
        expect(active.reinforcement).toHaveLength(1);
    });

    it('getActivePhrases filters hidden phrases', async () => {
        await hideBuiltInPhrase('panic', 'en', 'prep1');
        const active = await getActivePhrases('panic', 'en', builtIn);
        expect(active.preparation).toHaveLength(1);
        expect(active.preparation[0].id).toBe('prep2');
    });

    it('getActivePhrases appends user phrases', async () => {
        await addUserPhrase('panic', 'en', 'preparation', 'User prep');
        const active = await getActivePhrases('panic', 'en', builtIn);
        expect(active.preparation).toHaveLength(3);
        expect(active.preparation[2].text).toBe('User prep');
    });

    it('getActivePhrases combines filtering and user phrases', async () => {
        await hideBuiltInPhrase('panic', 'en', 'prep1');
        await addUserPhrase('panic', 'en', 'confrontation', 'My confrontation');
        const active = await getActivePhrases('panic', 'en', builtIn);
        expect(active.preparation).toHaveLength(1);
        expect(active.confrontation).toHaveLength(2);
    });
});

// ============================================
// Active Flat Phrases
// ============================================

describe('Active Flat Phrases', () => {
    const builtIn: Phrase[] = [
        { id: 'act1', text: 'Notice your feet' },
        { id: 'act2', text: 'Breathe deeply' },
    ];

    it('getActiveFlatPhrases returns all built-in when none hidden', async () => {
        const active = await getActiveFlatPhrases('grounding', 'en', builtIn);
        expect(active).toHaveLength(2);
    });

    it('getActiveFlatPhrases filters hidden and appends user phrases', async () => {
        await hideBuiltInPhrase('grounding', 'en', 'act1');
        await addUserPhrase('grounding', 'en', 'general', 'My phrase');
        const active = await getActiveFlatPhrases('grounding', 'en', builtIn);
        expect(active).toHaveLength(2);
        expect(active[0].id).toBe('act2');
        expect(active[1].text).toBe('My phrase');
    });
});

// ============================================
// Mode Visibility
// ============================================

describe('Mode Visibility', () => {
    it('getHiddenModes returns ["sadness"] by default', async () => {
        const hidden = await getHiddenModes();
        expect(hidden).toEqual(['sadness']);
    });

    it('hideMode adds a mode', async () => {
        await hideMode('anger');
        const hidden = await getHiddenModes();
        expect(hidden).toContain('anger');
        expect(hidden).toContain('sadness');
    });

    it('hideMode is idempotent', async () => {
        await hideMode('anger');
        await hideMode('anger');
        const hidden = await getHiddenModes();
        expect(hidden.filter(m => m === 'anger')).toHaveLength(1);
    });

    it('unhideMode removes a mode', async () => {
        await unhideMode('sadness');
        const hidden = await getHiddenModes();
        expect(hidden).not.toContain('sadness');
    });

    it('getVisibleModes filters hidden modes', async () => {
        const visible = await getVisibleModes();
        expect(visible).not.toContain('sadness');
        expect(visible).toContain('panic');
        expect(visible).toContain('grounding');
    });
});

// ============================================
// Custom Mode CRUD
// ============================================

describe('Custom Mode CRUD', () => {
    it('getCustomModes returns empty array initially', async () => {
        const modes = await getCustomModes();
        expect(modes).toEqual([]);
    });

    it('addCustomMode stores mode with generated ID', async () => {
        const mode = await addCustomMode('Focus', 'random');
        expect(mode.name).toBe('Focus');
        expect(mode.method).toBe('random');
        expect(mode.id).toMatch(/^custom_/);
        expect(mode.createdAt).toBeGreaterThan(0);

        const stored = await getCustomModes();
        expect(stored).toHaveLength(1);
    });

    it('updateCustomMode changes name', async () => {
        const mode = await addCustomMode('Old Name', 'sit');
        await updateCustomMode(mode.id, 'New Name');

        const updated = await getCustomModeById(mode.id);
        expect(updated?.name).toBe('New Name');
        expect(updated?.method).toBe('sit');
    });

    it('deleteCustomMode removes mode and associated storage keys', async () => {
        const mode = await addCustomMode('Temp', 'random');
        await addUserPhrase(mode.id, 'en', 'general', 'Custom phrase');
        await deleteCustomMode(mode.id);

        const modes = await getCustomModes();
        expect(modes).toHaveLength(0);

        const phrases = await getUserPhrases(mode.id, 'en', 'general');
        expect(phrases).toEqual([]);
    });

    it('getCustomModeById returns null for missing ID', async () => {
        const mode = await getCustomModeById('nonexistent');
        expect(mode).toBeNull();
    });

    it('getVisibleCustomModes excludes hidden custom modes', async () => {
        const mode1 = await addCustomMode('Visible', 'sit');
        const mode2 = await addCustomMode('Hidden', 'random');
        await hideMode(mode2.id);

        const visible = await getVisibleCustomModes();
        expect(visible).toHaveLength(1);
        expect(visible[0].id).toBe(mode1.id);
    });
});

// ============================================
// getModeMethod
// ============================================

describe('getModeMethod', () => {
    it('returns correct method for each built-in mode', async () => {
        for (const mode of BUILT_IN_MODES) {
            const method = await getModeMethod(mode);
            expect(method).toBe(BUILT_IN_MODE_METHODS[mode]);
        }
    });

    it('returns stored method for custom modes', async () => {
        const mode = await addCustomMode('Custom', 'seeAll');
        const method = await getModeMethod(mode.id);
        expect(method).toBe('seeAll');
    });

    it('defaults to sit for unknown custom mode', async () => {
        const method = await getModeMethod('nonexistent_custom');
        expect(method).toBe('sit');
    });
});

// ============================================
// resetAllToDefaults
// ============================================

describe('resetAllToDefaults', () => {
    it('clears all customizations', async () => {
        await addUserPhrase('panic', 'en', 'preparation', 'Custom phrase');
        await hideBuiltInPhrase('panic', 'en', 'prep1');
        await hideMode('anger');
        await addCustomMode('My Mode', 'random');
        await markNavigationHintSeen();

        await resetAllToDefaults();

        const phrases = await getUserPhrases('panic', 'en', 'preparation');
        expect(phrases).toEqual([]);

        const hidden = await getHiddenPhrases('panic', 'en');
        expect(hidden).toEqual([]);

        // Hidden modes reset to default (sadness)
        const hiddenModes = await getHiddenModes();
        expect(hiddenModes).toEqual(['sadness']);

        const customs = await getCustomModes();
        expect(customs).toEqual([]);

        const hint = await hasSeenNavigationHint();
        expect(hint).toBe(false);
    });
});

// ============================================
// Navigation Hint
// ============================================

describe('Navigation Hint', () => {
    it('hasSeenNavigationHint returns false initially', async () => {
        const seen = await hasSeenNavigationHint();
        expect(seen).toBe(false);
    });

    it('markNavigationHintSeen sets to true', async () => {
        await markNavigationHintSeen();
        const seen = await hasSeenNavigationHint();
        expect(seen).toBe(true);
    });
});
