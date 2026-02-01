import React, { ElementRef, forwardRef, memo } from 'react';
import {
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type FeedbackProps = PressableProps & {
  pressedScale?: number;
  pressedOpacity?: number;
  animationDuration?: number;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PressableFeedback = forwardRef<ElementRef<typeof Pressable>, FeedbackProps>(
  (
    {
      style,
      pressedScale = 0.97,
      pressedOpacity = 0.9,
      animationDuration = 100,
      onPressIn,
      onPressOut,
      ...rest
    },
    ref,
  ) => {
    const pressed = useSharedValue(0);

    const handlePressIn: PressableProps['onPressIn'] = (event) => {
      pressed.value = withTiming(1, {
        duration: animationDuration,
        easing: Easing.out(Easing.quad),
      });
      onPressIn?.(event);
    };

    const handlePressOut: PressableProps['onPressOut'] = (event) => {
      pressed.value = withTiming(0, {
        duration: animationDuration,
        easing: Easing.out(Easing.quad),
      });
      onPressOut?.(event);
    };

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        {
          scale: interpolate(pressed.value, [0, 1], [1, pressedScale]),
        },
      ],
      opacity: interpolate(pressed.value, [0, 1], [1, pressedOpacity]),
    }));

    const combinedStyle: PressableProps['style'] =
      typeof style === 'function'
        ? (state: PressableStateCallbackType) => [animatedStyle as StyleProp<ViewStyle>, style(state)]
        : [animatedStyle as StyleProp<ViewStyle>, style];

    return (
      <AnimatedPressable
        ref={ref}
        {...rest}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={combinedStyle}
      />
    );
  },
);

PressableFeedback.displayName = 'PressableFeedback';

export default memo(PressableFeedback);
