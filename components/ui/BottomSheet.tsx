import { Modal, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores';

type BottomSheetProps = {
  visible: boolean;
  title?: string;
  height?: number | `${number}%`;
  onClose: () => void;
  onDismiss?: () => void;
  leftLabel?: string;
  onLeftPress?: () => void;
  rightLabel?: string;
  onRightPress?: () => void;
  children: React.ReactNode;
};

export function BottomSheet({
  visible,
  title,
  height,
  onClose,
  onDismiss,
  leftLabel,
  onLeftPress,
  rightLabel,
  onRightPress,
  children,
}: BottomSheetProps) {
  const isDarkMode = useAuthStore((s) => s.isDarkMode);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} onDismiss={onDismiss}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="bg-appBg dark:bg-appDarkBg rounded-t-[28px] overflow-hidden border border-appBorder dark:border-appDarkBorder"
            style={{ height: height || undefined }}
          >
            <View className="items-center pt-2">
              <View className="w-12 h-1.5 rounded-full bg-appBorder dark:bg-appDarkBorder" />
            </View>

            {(title || leftLabel || rightLabel) && (
              <View className="px-4 pt-3 pb-4 flex-row items-center justify-between">
                <View className="w-16">
                  {leftLabel ? (
                    <TouchableOpacity onPress={onLeftPress || onClose} activeOpacity={0.85}>
                      <Text className="text-[13px] font-extrabold text-appMuted dark:text-appDarkMuted">
                        {leftLabel}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={onClose}
                      activeOpacity={0.85}
                      className="w-10 h-10 rounded-2xl bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder items-center justify-center"
                    >
                      <Ionicons name="close" size={18} color={isDarkMode ? '#d6d3d1' : '#78716c'} />
                    </TouchableOpacity>
                  )}
                </View>

                <View className="flex-1 items-center px-2">
                  {title ? (
                    <Text className="text-[16px] font-extrabold text-appText dark:text-appDarkText" numberOfLines={1}>
                      {title}
                    </Text>
                  ) : null}
                </View>

                <View className="w-16 items-end">
                  {rightLabel ? (
                    <TouchableOpacity onPress={onRightPress || onClose} activeOpacity={0.85}>
                      <Text className="text-[13px] font-extrabold text-primary">{rightLabel}</Text>
                    </TouchableOpacity>
                  ) : (
                    <View className="w-10 h-10" />
                  )}
                </View>
              </View>
            )}

            {children}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
