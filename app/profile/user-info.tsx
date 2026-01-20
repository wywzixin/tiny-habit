import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, InteractionManager, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../stores';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { uploadFile, updateProfile as updateProfileApi } from '../../services/api';
import { t } from '../../utils/i18n';

export default function UserInfoScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((s) => s.isDarkMode);
  const { user, isLoggedIn, updateUser, clearAuth, language } = useAuthStore();
  
  const logout = () => {
    clearAuth();
    router.replace('/auth/login');
  };
  
  const updateProfile = (updates: Partial<typeof user>) => {
    updateUser(updates);
  };

  const [showAvatarSheet, setShowAvatarSheet] = useState(false);
  const [showGenderSheet, setShowGenderSheet] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingPicker, setPendingPicker] = useState<'camera' | 'library' | null>(null);

  const [draftName, setDraftName] = useState(user?.username || '');
  const [draftGender, setDraftGender] = useState(user?.gender || 'unknown');
  const [draftAvatarUrl, setDraftAvatarUrl] = useState(user?.avatarUrl || '');

  const identifierText = useMemo(() => {
    if (!user) return '';
    return user.email || user.phone || '';
  }, [user]);

  const handleAvatarSheetDismiss = () => {
    if (!pendingPicker) return;
    const next = pendingPicker;
    setPendingPicker(null);
    InteractionManager.runAfterInteractions(() => {
      if (next === 'camera') {
        pickFromCamera();
      } else {
        pickFromLibrary();
      }
    });
  };

  const pickFromLibrary = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('相册权限:', perm);
      
      if (!perm.granted) {
        if (!perm.canAskAgain) {
          Alert.alert(t(language, 'auth.permissionBlocked'), t(language, 'auth.photoPermission'), [
            { text: t(language, 'common.cancel'), style: 'cancel' },
            { text: t(language, 'auth.openSettings'), onPress: () => Linking.openSettings() },
          ]);
        } else {
          Alert.alert(t(language, 'auth.permissionRequired'), t(language, 'auth.photoPermission'));
        }
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      
      console.log('选择结果:', result);

      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset?.uri) return;
      
      await uploadAvatar(asset.uri);
    } catch (error) {
      console.error('选择相册失败:', error);
      Alert.alert(t(language, 'common.error'), t(language, 'common.tryLater'));
    }
  };

  const pickFromCamera = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      console.log('相机权限:', perm);
      
      if (!perm.granted) {
        if (!perm.canAskAgain) {
          Alert.alert(t(language, 'auth.permissionBlocked'), t(language, 'auth.cameraPermission'), [
            { text: t(language, 'common.cancel'), style: 'cancel' },
            { text: t(language, 'auth.openSettings'), onPress: () => Linking.openSettings() },
          ]);
        } else {
          Alert.alert(t(language, 'auth.permissionRequired'), t(language, 'auth.cameraPermission'));
        }
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      
      console.log('拍照结果:', result);

      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset?.uri) return;
      
      await uploadAvatar(asset.uri);
    } catch (error) {
      console.error('拍照失败:', error);
      Alert.alert(t(language, 'common.error'), t(language, 'common.tryLater'));
    }
  };
  
  const uploadAvatar = async (uri: string) => {
    try {
      setUploading(true);
      
      const file = {
        uri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      };
      
      const uploadResult = await uploadFile(file);
      setDraftAvatarUrl(uploadResult.url);
      setHasChanges(true);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error('上传头像失败:', error);
      Alert.alert(t(language, 'common.error'), t(language, 'profile.avatarUploadFailed'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    
    try {
      setSaving(true);
      
      const updates: any = {};
      if (draftName !== user?.username) updates.username = draftName;
      if (draftGender !== user?.gender) updates.gender = draftGender;
      if (draftAvatarUrl !== user?.avatarUrl) updates.avatarUrl = draftAvatarUrl;
      
      if (Object.keys(updates).length === 0) {
        setHasChanges(false);
        return;
      }
      
      await updateProfileApi(updates);
      updateProfile(updates);
      
      setHasChanges(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t(language, 'common.success'), t(language, 'profile.infoUpdated'), [
        {
          text: t(language, 'common.confirm'),
          onPress: () => router.replace('/(tabs)/profile'),
        },
      ]);
    } catch (error: any) {
      console.error('更新失败:', error);
      Alert.alert(t(language, 'common.error'), t(language, 'profile.saveFailed'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView className="flex-1 bg-appBg dark:bg-appDarkBg items-center justify-center px-6">
        <Text className="text-[14px] font-semibold text-appMuted dark:text-appDarkMuted">
          {t(language, 'auth.loginRequired')}
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/auth/login')}
          activeOpacity={0.85}
          className="mt-4 px-4 py-3 rounded-[22px] bg-appText dark:bg-appDarkText"
        >
          <Text className="text-white dark:text-appText font-extrabold">{t(language, 'auth.gotoLogin')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-appBg dark:bg-appDarkBg">
      <View className="px-5 pt-2 pb-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.85}
            className="w-10 h-10 rounded-2xl bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder items-center justify-center"
          >
            <Ionicons name="arrow-back" size={18} color={isDarkMode ? '#d6d3d1' : '#78716c'} />
          </TouchableOpacity>
          <Text className="text-base font-extrabold text-appText dark:text-appDarkText">
            {t(language, 'profile.userInfo')}
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!hasChanges || saving}
            activeOpacity={0.85}
            className={`px-4 h-10 rounded-2xl items-center justify-center ${
              hasChanges && !saving ? 'bg-appText dark:bg-appDarkText' : 'bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder'
            }`}
          >
            <Text className={`text-sm font-extrabold ${
              hasChanges && !saving ? 'text-white dark:text-appText' : 'text-appMuted dark:text-appDarkMuted'
            }`}>
              {saving ? t(language, 'common.saving') : t(language, 'common.save')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
      >
        <View className="items-center py-4">
          <TouchableOpacity 
            onPress={() => setShowAvatarSheet(true)} 
            activeOpacity={0.85}
            disabled={uploading}
          >
            <View className="w-24 h-24 rounded-full bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder items-center justify-center overflow-hidden">
              {draftAvatarUrl ? (
                <Image source={{ uri: draftAvatarUrl }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <Ionicons name="person" size={42} color={isDarkMode ? '#a8a29e' : '#78716c'} />
              )}
              {uploading && (
                <View className="absolute inset-0 bg-black/50 items-center justify-center">
                  <Text className="text-white text-xs">{t(language, 'profile.uploading')}</Text>
                </View>
              )}
            </View>
            <View className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-appText dark:bg-appDarkText items-center justify-center border-4 border-appBg dark:border-appDarkBg">
              <Ionicons name="camera" size={14} color={isDarkMode ? '#0c0a09' : 'white'} />
            </View>
          </TouchableOpacity>
        </View>

        <View className="bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder rounded-[22px] overflow-hidden">
          <View className="px-4 py-4 flex-row items-center justify-between border-b border-appBorder dark:border-appDarkBorder">
            <Text className="text-[14px] font-extrabold text-appText dark:text-appDarkText">{t(language, 'profile.nickname')}</Text>
            <View className="flex-1 ml-4">
              <TextInput
                value={draftName}
                onChangeText={(text) => { setDraftName(text); setHasChanges(true); }}
                placeholder={t(language, 'profile.nickname')}
                className="text-right text-[14px] font-semibold text-appText dark:text-appDarkText"
                placeholderTextColor={isDarkMode ? '#a8a29e' : '#a8a29e'}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setShowGenderSheet(true)}
            activeOpacity={0.85}
            className="px-4 py-4 flex-row items-center justify-between border-b border-appBorder dark:border-appDarkBorder"
          >
            <Text className="text-[14px] font-extrabold text-appText dark:text-appDarkText">{t(language, 'profile.gender')}</Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-[14px] font-semibold text-appMuted dark:text-appDarkMuted">
                {draftGender === 'male'
                  ? t(language, 'profile.genderMale')
                  : draftGender === 'female'
                    ? t(language, 'profile.genderFemale')
                    : t(language, 'profile.genderUnknown')}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#44403c' : '#d6d3d1'} />
            </View>
          </TouchableOpacity>

          <View className="px-4 py-4 flex-row items-center justify-between border-b border-appBorder dark:border-appDarkBorder">
            <Text className="text-[14px] font-extrabold text-appText dark:text-appDarkText">{t(language, 'profile.account')}</Text>
            <Text className="text-[14px] font-semibold text-appMuted dark:text-appDarkMuted">
              {identifierText}
            </Text>
          </View>

          <View className="px-4 py-4 flex-row items-center justify-between border-b border-appBorder dark:border-appDarkBorder">
            <Text className="text-[14px] font-extrabold text-appText dark:text-appDarkText">{t(language, 'profile.member')}</Text>
            <Text className="text-[14px] font-semibold text-appMuted dark:text-appDarkMuted">
              {t(language, 'profile.notActive')}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => Alert.alert(t(language, 'common.confirm'), t(language, 'common.comingSoon'))}
            activeOpacity={0.85}
            className="px-4 py-4 flex-row items-center justify-between"
          >
            <Text className="text-[14px] font-extrabold text-appText dark:text-appDarkText">{t(language, 'profile.accountSecurity')}</Text>
            <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#44403c' : '#d6d3d1'} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => { logout(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); router.back(); }}
          activeOpacity={0.85}
          className="mt-6 py-4 rounded-[22px] bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder items-center"
        >
          <Text className="text-red-500 font-extrabold">{t(language, 'profile.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomSheet
        visible={showAvatarSheet}
        title={t(language, 'profile.avatarSelect')}
        onClose={() => setShowAvatarSheet(false)}
        onDismiss={handleAvatarSheetDismiss}
      >
        <View className="px-5 pb-8">
          <TouchableOpacity
            onPress={() => { 
              setPendingPicker('camera');
              setShowAvatarSheet(false);
            }}
            activeOpacity={0.85}
            className="py-4 rounded-[22px] bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder items-center"
          >
            <Text className="text-appText dark:text-appDarkText font-extrabold">{t(language, 'profile.takePhoto')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { 
              setPendingPicker('library');
              setShowAvatarSheet(false);
            }}
            activeOpacity={0.85}
            className="mt-3 py-4 rounded-[22px] bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder items-center"
          >
            <Text className="text-appText dark:text-appDarkText font-extrabold">{t(language, 'profile.chooseFromAlbum')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowAvatarSheet(false)}
            activeOpacity={0.85}
            className="mt-3 py-4 rounded-[22px] bg-appText dark:bg-appDarkText items-center"
          >
            <Text className="text-white dark:text-appText font-extrabold">{t(language, 'common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      <BottomSheet
        visible={showGenderSheet}
        title={t(language, 'profile.gender')}
        onClose={() => setShowGenderSheet(false)}
      >
        <View className="px-5 pb-8 gap-3">
          {(['male', 'female', 'unknown'] as const).map((g) => (
            <TouchableOpacity
              key={g}
              onPress={() => { setDraftGender(g); setHasChanges(true); setShowGenderSheet(false); Haptics.selectionAsync(); }}
              activeOpacity={0.85}
              className="py-4 rounded-[22px] bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder flex-row items-center justify-between px-4"
            >
              <Text className="text-appText dark:text-appDarkText font-extrabold">
                {g === 'male'
                  ? t(language, 'profile.genderMale')
                  : g === 'female'
                    ? t(language, 'profile.genderFemale')
                    : t(language, 'profile.genderUnknown')}
              </Text>
              {draftGender === g && (
                <Ionicons name="checkmark" size={18} color="#10B981" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

