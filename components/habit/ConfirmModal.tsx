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
      <View className="flex-1 bg-black/40 items-center justify-center px-6">
        <Animated.View
          style={{ transform: [{ scale: cardScale }] }}
          className="w-full max-w-sm rounded-[28px] overflow-hidden"
        >
          <View
            className="px-6"
            style={{
              paddingVertical: 28,
              backgroundColor: isDarkMode ? 'rgba(30,30,34,0.92)' : 'rgba(244,244,246,0.96)',
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.8)',
            }}
          >
            <Text className="text-[18px] font-extrabold text-appText dark:text-appDarkText">
              {title}
            </Text>
            <Text className="text-[14px] font-medium text-appMuted dark:text-appDarkMuted mt-2 leading-relaxed">
              {message}
            </Text>

            <View className="flex-row gap-3 mt-6">
              <TouchableOpacity
                onPress={onCancel}
                activeOpacity={0.85}
                className="flex-1 rounded-full py-3"
                style={{ backgroundColor: isDarkMode ? 'rgba(82,82,91,0.65)' : '#D1D5DB' }}
              >
                <Text className="text-[15px] font-bold text-appText dark:text-appDarkText text-center">
                  {cancelText}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onConfirm}
                activeOpacity={0.85}
                className="flex-1 rounded-full py-3"
                style={{ backgroundColor: isDarkMode ? 'rgba(82,82,91,0.65)' : '#D1D5DB' }}
              >
                <Text className="text-[15px] font-bold text-red-500 text-center">
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
