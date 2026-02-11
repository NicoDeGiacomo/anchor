import React, { memo } from 'react';
import { Image, ImageSourcePropType } from 'react-native';
import { useColorScheme } from './useColorScheme';

const logoLight = require('../assets/images/logo-with-name.png');
const logoDark = require('../assets/images/logo-with-name-dark.png');

interface LogoWithNameProps {
  width?: number;
}

export const LogoWithName = memo(function LogoWithName({ width = 200 }: LogoWithNameProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'black' || colorScheme === 'dark';
  const source: ImageSourcePropType = isDark ? logoDark : logoLight;

  return (
    <Image
      source={source}
      style={{ width, height: width }}
      resizeMode="contain"
      accessibilityLabel="Anchor logo"
    />
  );
});
