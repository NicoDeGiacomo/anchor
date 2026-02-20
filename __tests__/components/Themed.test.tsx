import { render } from '@testing-library/react-native';
import React from 'react';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { clearStorage } from '../helpers/storage-helpers';

// Mock useColorScheme to return a predictable value
let mockColorScheme = 'light' as 'black' | 'dark' | 'light' | 'white';
jest.mock('@/components/useColorScheme', () => ({
    useColorScheme: () => mockColorScheme,
}));

beforeEach(async () => {
    await clearStorage();
    mockColorScheme = 'light';
});

describe('Themed', () => {
    describe('Text', () => {
        it('renders children content', () => {
            const { getByText } = render(<Text>Hello World</Text>);
            expect(getByText('Hello World')).toBeTruthy();
        });

        it('applies theme text color', () => {
            mockColorScheme = 'dark';
            const { getByText } = render(<Text>Themed</Text>);
            const el = getByText('Themed');
            // In dark mode, text color should be the dark theme text color
            expect(el.props.style).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ color: Colors.dark.text })
                ])
            );
        });
    });

    describe('View', () => {
        it('renders with theme background color', () => {
            const { getByTestId } = render(
                <View testID="themed-view" />
            );
            const el = getByTestId('themed-view');
            expect(el.props.style).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ backgroundColor: Colors.light.background })
                ])
            );
        });
    });

    describe('color overrides', () => {
        it('lightColor/darkColor overrides apply', () => {
            mockColorScheme = 'light';
            const { getByText } = render(
                <Text lightColor="#ff0000" darkColor="#00ff00">Override</Text>
            );
            const el = getByText('Override');
            expect(el.props.style).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ color: '#ff0000' })
                ])
            );
        });

        it('darkColor applies in dark mode', () => {
            mockColorScheme = 'dark';
            const { getByText } = render(
                <Text lightColor="#ff0000" darkColor="#00ff00">Override</Text>
            );
            const el = getByText('Override');
            expect(el.props.style).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ color: '#00ff00' })
                ])
            );
        });
    });
});
