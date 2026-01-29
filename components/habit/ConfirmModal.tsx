import { View, Text, Modal, TouchableOpacity, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '../../stores';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  cancelText?: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  cancelText = '再想想',
  confirmText = '确定',
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  const isDarkMode = useAuthStore((s) => s.isDarkMode);
  const cardScale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (visible) {
      cardScale.setValue(0.96);
      Animated.spring(cardScale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 16,
        mass: 1,
        stiffness: 180,
      }).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/45 items-center justify-center px-6">
        <Animated.View
          style={{ transform: [{ scale: cardScale }] }}
          className="w-full max-w-sm rounded-[24px] overflow-hidden"
        >
          <View className="bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder px-5 py-5">
            <Text className="text-[17px] font-extrabold text-appText dark:text-appDarkText text-center">
              {title}
            </Text>
            <Text className="text-[14px] font-medium text-appMuted dark:text-appDarkMuted text-center mt-2 leading-relaxed">
              {message}
            </Text>

            <View className="flex-row gap-3 mt-5">
              <TouchableOpacity
                onPress={onCancel}
                activeOpacity={0.85}
                className="flex-1 bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder rounded-2xl py-3"
              >
                <Text className="text-[15px] font-bold text-appText dark:text-appDarkText text-center">
                  {cancelText}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onConfirm}
                activeOpacity={0.85}
                className="flex-1 bg-red-500 rounded-2xl py-3"
              >
                <Text className="text-[15px] font-bold text-white text-center">
                  {confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
