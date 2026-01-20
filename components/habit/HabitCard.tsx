import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MicroBehavior } from '../../types';
import { useAuthStore } from '../../stores';
import { formatText, t } from '../../utils/i18n';

interface HabitCardProps {
  behavior: MicroBehavior;
  isChecked: boolean;
  onCheck: () => void;
  onPress: () => void;
}

export function HabitCard({ behavior, isChecked, onCheck, onPress }: HabitCardProps) {
  const language = useAuthStore((s) => s.language);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.92}
      className={`p-4 rounded-[22px] border flex-row items-center ${
        isChecked
          ? 'bg-appCard dark:bg-appDarkCard border-appBorder dark:border-appDarkBorder'
          : 'bg-appCard dark:bg-appDarkCard border-appBorder dark:border-appDarkBorder'
      }`}
    >
      <View
        className={`w-12 h-12 rounded-[16px] items-center justify-center mr-3 border ${
          isChecked
            ? 'bg-primary/10 border-primary/20 dark:bg-primary/15 dark:border-primary/30'
            : 'bg-appBg dark:bg-appDarkBg border-appBorder dark:border-appDarkBorder'
        }`}
      >
        <Text className="text-[22px]">{behavior.icon}</Text>
      </View>

      <View className="flex-1">
        <Text
          className={`text-[15px] font-extrabold ${
            isChecked ? 'text-appMuted dark:text-appDarkMuted line-through' : 'text-appText dark:text-appDarkText'
          }`}
          numberOfLines={1}
        >
          {behavior.behavior}
        </Text>
        <View className="flex-row items-center gap-2 mt-2">
          <View className="px-2.5 py-1 rounded-full bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder">
            <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted">
              {formatText(language, 'detail.after', { anchor: behavior.anchor })}
            </Text>
          </View>
          {behavior.reminderEnabled && (
            <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 dark:bg-primary/15 border border-primary/15 dark:border-primary/25">
              <Ionicons name="notifications" size={12} color="#10B981" />
              <Text className="text-[11px] font-bold text-primary">
                {behavior.reminderTime || t(language, 'profile.notifications')}
              </Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          onCheck();
        }}
        activeOpacity={0.85}
        className={`w-9 h-9 rounded-full items-center justify-center border ${
          isChecked
            ? 'bg-primary border-primary'
            : 'bg-appCard dark:bg-appDarkCard border-appBorder dark:border-appDarkBorder'
        }`}
      >
        {isChecked ? (
          <Ionicons name="checkmark" size={18} color="white" />
        ) : (
          <Ionicons name="ellipse-outline" size={18} color="#a8a29e" />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
