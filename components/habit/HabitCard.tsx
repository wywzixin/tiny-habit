import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MicroBehavior } from '../../types';

interface HabitCardProps {
  behavior: MicroBehavior;
  isChecked: boolean;
  onCheck: () => void;
  onPress: () => void;
}

export function HabitCard({ behavior, isChecked, onCheck, onPress }: HabitCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.95}
      className="bg-white p-4 rounded-[20px] border border-stone-200 flex-row items-center"
    >
      <View className="w-12 h-12 rounded-[14px] bg-stone-50 items-center justify-center mr-3">
        <Text className="text-2xl">{behavior.icon}</Text>
      </View>

      <View className="flex-1">
        <Text className="text-xs font-medium text-stone-400 mb-0.5">
          当 <Text className="text-stone-600 font-semibold">{behavior.anchor}</Text> 后
        </Text>
        <Text
          className={`text-base font-bold ${
            isChecked ? 'text-stone-400 line-through' : 'text-stone-700'
          }`}
        >
          {behavior.behavior}
        </Text>
      </View>

      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          onCheck();
        }}
        className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
          isChecked ? 'bg-primary border-primary' : 'border-stone-200'
        }`}
      >
        {isChecked && <Ionicons name="checkmark" size={14} color="white" />}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
