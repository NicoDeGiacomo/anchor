import React, { ElementRef, forwardRef, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  PressableProps,
  PressableStateCallbackType,
} from 'react-native';

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
    const pressValue = useRef(new Animated.Value(0)).current;

    const animateTo = (toValue: number) => {
      Animated.timing(pressValue, {
        toValue,
        duration: animationDuration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    };

    const handlePressIn: PressableProps['onPressIn'] = (event) => {
      animateTo(1);
      onPressIn?.(event);
    };

    const handlePressOut: PressableProps['onPressOut'] = (event) => {
      animateTo(0);
      onPressOut?.(event);
    };

    const animatedStyle = {
      transform: [
        {
          scale: pressValue.interpolate({
            inputRange: [0, 1],
            outputRange: [1, pressedScale],
            extrapolate: 'clamp',
          }),
        },
      ],
      opacity: pressValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, pressedOpacity],
        extrapolate: 'clamp',
      }),
    };

    const combinedStyle: PressableProps['style'] =
      typeof style === 'function'
        ? (state: PressableStateCallbackType) => [animatedStyle, style(state)]
        : [animatedStyle, style];

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

export default PressableFeedback;

