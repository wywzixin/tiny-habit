import { View, TextInput, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  icon?: keyof typeof Ionicons.glyphMap;
}

export function Input({ icon, className, ...props }: InputProps) {
  return (
    <View className={`bg-white p-1 rounded-[14px] border border-stone-200 flex-row items-center ${className || ''}`}>
      {icon && (
        <View className="w-10 h-10 items-center justify-center">
          <Ionicons name={icon} size={20} color="#a8a29e" />
        </View>
      )}
      <TextInput
        className="flex-1 bg-transparent text-stone-700 font-medium h-12 text-[15px]"
        placeholderTextColor="#d6d3d1"
        {...props}
      />
    </View>
  );
}
