import React, { memo } from 'react';
import { Image, ImageSourcePropType } from 'react-native';
import { useColorScheme } from './useColorScheme';

const logoLight = require('../assets/images/splash-icon.png');
const logoDark = require('../assets/images/splash-icon-dark.png');

interface LogoProps {
  size?: number;
}

export const Logo = memo(function Logo({ size = 60 }: LogoProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'black' || colorScheme === 'dark';
  const source: ImageSourcePropType = isDark ? logoDark : logoLight;

  return (
    <Image
      source={source}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
});
