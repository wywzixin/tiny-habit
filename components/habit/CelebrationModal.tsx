import { View, Text, Modal, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../stores';
import { themeColors } from '../../stores/authStore';

interface CelebrationModalProps {
  visible: boolean;
  celebration: string;
  onClose: () => void;
}

const confettiPieces = [
  { x: -32, y: -8, size: 6, color: '#F59E0B', delay: 0, rotate: -10, shape: 'dot' as const },
  { x: 34, y: -10, size: 5, color: '#60A5FA', delay: 80, rotate: 16, shape: 'bar' as const },
  { x: -6, y: -26, size: 4, color: '#EC4899', delay: 140, rotate: -6, shape: 'dot' as const },
  { x: 18, y: -28, size: 4, color: '#22C55E', delay: 200, rotate: 10, shape: 'bar' as const },
  { x: -28, y: 6, size: 5, color: '#A855F7', delay: 220, rotate: -14, shape: 'bar' as const },
  { x: 28, y: 8, size: 6, color: '#F97316', delay: 260, rotate: 12, shape: 'dot' as const },
];

export function CelebrationModal({ visible, celebration, onClose }: CelebrationModalProps) {
  const isDarkMode = useAuthStore((s) => s.isDarkMode);
  const themeColor = useAuthStore((s) => s.themeColor);
  const currentTheme = themeColors[themeColor];
  const accent = currentTheme.primary;
  const accentSoft = currentTheme.primaryLight;
  const headerGradient = isDarkMode ? [accent + 'E6', accent + 'B3'] : [accent + 'F2', accentSoft];
  const glowBg = isDarkMode ? accent + '2A' : accent + '22';
  const pillBg = isDarkMode ? accent + '24' : accent + '18';
  const cardBg = isDarkMode ? 'rgba(255,255,255,0.06)' : '#F6F7FB';
  const cardScale = useRef(new Animated.Value(0.96)).current;
  const iconScale = useRef(new Animated.Value(0.92)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.9)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    confettiPieces.map(() => ({
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(0),
      rotate: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      cardScale.setValue(0.96);
      iconScale.setValue(0.92);
      iconRotate.setValue(0);
      glowScale.setValue(0.9);
      glowOpacity.setValue(0);
      confettiAnims.forEach((anim) => {
        anim.translateY.setValue(0);
        anim.opacity.setValue(0);
        anim.rotate.setValue(0);
      });

      const confettiAnimations = confettiAnims.map((anim, index) =>
        Animated.sequence([
          Animated.delay(confettiPieces[index].delay),
          Animated.parallel([
            Animated.timing(anim.opacity, {
              toValue: 1,
              duration: 180,
              useNativeDriver: true,
            }),
            Animated.timing(anim.translateY, {
              toValue: -16,
              duration: 900,
              useNativeDriver: true,
            }),
            Animated.timing(anim.rotate, {
              toValue: 1,
              duration: 900,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: 260,
            useNativeDriver: true,
          }),
        ])
      );

      Animated.parallel([
        Animated.spring(cardScale, {
          toValue: 1,
          useNativeDriver: true,
          damping: 16,
          mass: 1,
          stiffness: 180,
        }),
        Animated.sequence([
          Animated.spring(iconScale, {
            toValue: 1,
            useNativeDriver: true,
            damping: 10,
            mass: 1,
            stiffness: 260,
          }),
          Animated.spring(iconScale, {
            toValue: 0.98,
            useNativeDriver: true,
            damping: 14,
            mass: 1,
            stiffness: 220,
          }),
          Animated.spring(iconScale, {
            toValue: 1,
            useNativeDriver: true,
            damping: 12,
            mass: 1,
            stiffness: 220,
          }),
        ]),
        Animated.timing(iconRotate, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(glowOpacity, {
            toValue: isDarkMode ? 0.22 : 0.45,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(glowScale, {
            toValue: 1.05,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
        ...confettiAnimations,
      ]).start();

      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  const rotate = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-4deg', '4deg'],
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/40 items-center justify-center px-6">
        <Animated.View
          style={{ transform: [{ scale: cardScale }] }}
          className="w-full max-w-sm rounded-[28px] overflow-hidden"
        >
          <View className="bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder">
            <LinearGradient
              colors={headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ paddingHorizontal: 24, paddingTop: 22, paddingBottom: 18 }}
            >
              <Animated.View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  right: -38,
                  top: -26,
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  opacity: glowOpacity,
                  transform: [{ scale: glowScale }],
                }}
              >
                <LinearGradient
                  colors={
                    isDarkMode
                      ? ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0)']
                      : ['rgba(255,255,255,0.7)', 'rgba(255,255,255,0)']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ flex: 1, borderRadius: 70 }}
                />
              </Animated.View>

              <View className="items-center">
                <View style={{ width: 120, height: 96, alignItems: 'center', justifyContent: 'center' }}>
                  {confettiPieces.map((piece, index) => {
                    const anim = confettiAnims[index];
                    const rotatePiece = anim.rotate.interpolate({
                      inputRange: [0, 1],
                      outputRange: [`${piece.rotate}deg`, `${piece.rotate + 12}deg`],
                    });
                    const isBar = piece.shape === 'bar';
                    return (
                      <Animated.View
                        key={`confetti-${index}`}
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          width: isBar ? 4 : piece.size,
                          height: isBar ? 10 : piece.size,
                          borderRadius: isBar ? 2 : piece.size / 2,
                          backgroundColor: piece.color,
                          opacity: anim.opacity,
                          transform: [
                            { translateX: piece.x },
                            { translateY: piece.y },
                            { translateY: anim.translateY },
                            { rotate: rotatePiece },
                          ],
                        }}
                      />
                    );
                  })}
                  <Animated.View style={{ transform: [{ scale: iconScale }, { rotate }] }}>
                    <View
                      className="items-center justify-center rounded-[26px]"
                      style={{ width: 76, height: 76, backgroundColor: glowBg }}
                    >
                      <View className="w-[64px] h-[64px] rounded-[22px] bg-white/95 items-center justify-center border border-white/40">
                        <Text className="text-[30px]">🎉</Text>
                      </View>
                    </View>
                  </Animated.View>
                </View>

                <Text className="text-[20px] font-extrabold text-appText dark:text-appDarkText mt-4">
                  太棒了
                </Text>
                <View className="mt-2 px-3 py-1 rounded-full" style={{ backgroundColor: pillBg }}>
                  <Text className="text-[12px] font-extrabold" style={{ color: accent }}>
                    +1 行动值
                  </Text>
                </View>
              </View>
            </LinearGradient>

            <View className="px-6 pt-4 pb-6">
              <View className="rounded-[18px] px-4 py-4" style={{ backgroundColor: cardBg }}>
                <Text className="text-[11px] font-bold text-appMuted dark:text-appDarkMuted">
                  记得庆祝
                </Text>
                <Text className="text-[15px] font-semibold text-appText dark:text-appDarkText mt-2">
                  {celebration}
                </Text>
              </View>

              <Text className="text-[11px] font-semibold text-center text-appMuted dark:text-appDarkMuted mt-4">
                每一次小小的行动，都在让你变得更好
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
