import { View, TextInput, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  icon?: keyof typeof Ionicons.glyphMap;
}

export function Input({ icon, className, ...props }: InputProps) {
  return (
    <View className={`bg-appCard dark:bg-appDarkCard p-1 rounded-[16px] border border-appBorder dark:border-appDarkBorder flex-row items-center ${className || ''}`}>
      {icon && (
        <View className="w-10 h-10 items-center justify-center">
          <Ionicons name={icon} size={20} color="#a8a29e" />
        </View>
      )}
      <TextInput
        className="flex-1 bg-transparent text-appText dark:text-appDarkText font-semibold h-12 text-[15px]"
        placeholderTextColor="#a8a29e"
        {...props}
      />
    </View>
  );
}
