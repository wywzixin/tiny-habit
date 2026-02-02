import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MicroBehavior } from '../../types';
import { useAuthStore } from '../../stores';
import { themeColors } from '../../stores/authStore';
import { formatText, t } from '../../utils/i18n';

interface HabitCardProps {
  behavior: MicroBehavior;
  isChecked: boolean;
  onCheck: () => void;
  onPress: () => void;
}

export function HabitCard({ behavior, isChecked, onCheck, onPress }: HabitCardProps) {
  const language = useAuthStore((s) => s.language);
  const themeColor = useAuthStore((s) => s.themeColor);
  const currentTheme = themeColors[themeColor];

  return (
    <Pressable
      onPress={onPress}
      className={`p-4 rounded-[22px] border flex-row items-center ${
        isChecked
          ? 'bg-appCard dark:bg-appDarkCard border-appBorder dark:border-appDarkBorder'
          : 'bg-appCard dark:bg-appDarkCard border-appBorder dark:border-appDarkBorder'
      }`}
      style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
    >
      <View
        className="w-12 h-12 rounded-[16px] items-center justify-center mr-3 border"
        style={
          isChecked
            ? { backgroundColor: currentTheme.primary + '15', borderColor: currentTheme.primary + '30' }
            : undefined
        }
      >
        <Text className="text-[22px]">{behavior.icon}</Text>
      </View>

      <View className="flex-1">
        <Text
          className={`text-[15px] font-extrabold ${
            isChecked ? 'text-appMuted dark:text-appDarkMuted line-through' : 'text-appText dark:text-appDarkText'
          }`}
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
            <View
              className="flex-row items-center gap-1 px-2.5 py-1 rounded-full border"
              style={{ backgroundColor: currentTheme.primary + '15', borderColor: currentTheme.primary + '25' }}
            >
              <Ionicons name="notifications" size={12} color={currentTheme.primary} />
              <Text className="text-[11px] font-bold" style={{ color: currentTheme.primary }}>
                {behavior.reminderTime || t(language, 'profile.notifications')}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          onCheck();
        }}
        className="w-9 h-9 rounded-full items-center justify-center border"
        style={({ pressed }) => [
          isChecked ? { backgroundColor: currentTheme.primary, borderColor: currentTheme.primary } : undefined,
          { opacity: pressed ? 0.85 : 1 },
        ]}
      >
        {isChecked ? (
          <Ionicons name="checkmark" size={18} color="white" />
        ) : (
          <Ionicons name="ellipse-outline" size={18} color="#a8a29e" />
        )}
      </Pressable>
    </Pressable>
  );
}
