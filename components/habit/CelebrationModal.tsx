import { View, Text, Modal, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../stores';

interface CelebrationModalProps {
  visible: boolean;
  celebration: string;
  onClose: () => void;
}

export function CelebrationModal({ visible, celebration, onClose }: CelebrationModalProps) {
  const isDarkMode = useAuthStore((s) => s.isDarkMode);
  const cardScale = useRef(new Animated.Value(0.96)).current;
  const iconScale = useRef(new Animated.Value(0.92)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      cardScale.setValue(0.96);
      iconScale.setValue(0.92);
      iconRotate.setValue(0);

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
      <View className="flex-1 bg-black/45 items-center justify-center px-6">
        <Animated.View
          style={{ transform: [{ scale: cardScale }] }}
          className="w-full max-w-sm rounded-[28px] overflow-hidden"
        >
          <View className="bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder px-6 py-6">
            <View className="items-center">
              <Animated.View style={{ transform: [{ scale: iconScale }, { rotate }] }}>
                <LinearGradient
                  colors={isDarkMode ? ['#059669', '#10B981'] : ['#10B981', '#34D399']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: 28,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <View className="w-[78px] h-[78px] rounded-[26px] bg-white items-center justify-center border border-white/30">
                    <Text className="text-[34px]">🎉</Text>
                  </View>
                </LinearGradient>
              </Animated.View>

              <Text className="text-[20px] font-extrabold text-appText dark:text-appDarkText mt-4">
                太棒了
              </Text>
              <View className="mt-2 px-3 py-1.5 rounded-full bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder">
                <Text className="text-[12px] font-extrabold text-primary">
                  +1 行动值
                </Text>
              </View>
            </View>

            <View className="mt-5 rounded-[22px] bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder px-4 py-4">
              <View className="flex-row items-center gap-2">
                <View className="w-9 h-9 rounded-2xl bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder items-center justify-center">
                  <Text className="text-[18px]">✨</Text>
                </View>
                <Text className="text-[13px] font-extrabold text-appText dark:text-appDarkText">
                  记得庆祝
                </Text>
              </View>
              <Text className="text-[14px] font-semibold text-appMuted dark:text-appDarkMuted mt-3">
                {celebration}
              </Text>
            </View>

            <Text className="text-[12px] font-semibold text-center text-appMuted dark:text-appDarkMuted mt-4">
              每一次小小的行动，都在让你变得更好
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
