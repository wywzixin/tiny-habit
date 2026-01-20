import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../../stores';
import { t } from '../../utils/i18n';

export default function EditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const language = useAuthStore((s) => s.language);

  useEffect(() => {
    if (!id) return;
    router.replace({ pathname: '/create', params: { editId: id } });
  }, [id, router]);

  return (
    <SafeAreaView className="flex-1 bg-appBg dark:bg-appDarkBg items-center justify-center px-6">
      <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted">
        {t(language, 'common.editingOpen')}
      </Text>
    </SafeAreaView>
  );
}
