import { View, Text, Modal } from 'react-native';
import { useEffect } from 'react';

interface CelebrationModalProps {
  visible: boolean;
  celebration: string;
  onClose: () => void;
}

export function CelebrationModal({ visible, celebration, onClose }: CelebrationModalProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/30 items-center justify-center">
        <View className="w-[85%] max-w-sm bg-white rounded-3xl p-6">
          <View className="items-center mb-4">
            <View className="w-20 h-20 rounded-full bg-primary items-center justify-center">
              <Text className="text-4xl">🎉</Text>
            </View>
          </View>

          <Text className="text-xl font-bold text-stone-700 text-center mb-2">
            太棒了！
          </Text>
          <Text className="text-sm text-stone-500 text-center mb-4">
            +1 行动值
          </Text>

          <View className="bg-primary-light rounded-2xl p-4 mb-3">
            <Text className="text-xs font-semibold text-primary mb-2">
              ✨ 记得庆祝
            </Text>
            <Text className="text-sm font-semibold text-stone-700">
              {celebration}
            </Text>
          </View>

          <Text className="text-xs text-center text-stone-400">
            每一次小小的行动，都在让你变得更好
          </Text>
        </View>
      </View>
    </Modal>
  );
}
