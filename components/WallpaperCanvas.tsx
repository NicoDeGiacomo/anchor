import React, { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';

import { WallpaperTemplate } from '@/constants/wallpaperTemplates';

interface WallpaperCanvasProps {
  template: WallpaperTemplate;
  phrase: string;
  width: number;
  height: number;
  fontSize?: number;
}

const WallpaperCanvas = forwardRef<ViewShot, WallpaperCanvasProps>(
  ({ template, phrase, width, height, fontSize: fontSizeProp }, ref) => {
    const fontSize = fontSizeProp ?? Math.round(width * 0.055);

    return (
      <ViewShot ref={ref} options={{ format: 'png', quality: 1 }} style={{ width, height }}>
        <View style={[styles.container, { width, height }]}>
          {template.type === 'solid' ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: template.color }]} />
          ) : (
            <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient
                  id="bg"
                  x1={String(template.direction.x1)}
                  y1={String(template.direction.y1)}
                  x2={String(template.direction.x2)}
                  y2={String(template.direction.y2)}
                >
                  <Stop offset="0" stopColor={template.colors[0]} />
                  <Stop offset="1" stopColor={template.colors[1]} />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width={String(width)} height={String(height)} fill="url(#bg)" />
            </Svg>
          )}
          <Text
            style={[
              styles.phrase,
              { color: template.textColor, fontSize },
            ]}
          >
            {phrase}
          </Text>
        </View>
      </ViewShot>
    );
  }
);

WallpaperCanvas.displayName = 'WallpaperCanvas';

export default WallpaperCanvas;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  phrase: {
    fontWeight: '300',
    textAlign: 'center',
    paddingHorizontal: '12%',
  },
});
