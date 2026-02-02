import { View, Text, ScrollView, Pressable, TextInput, Alert, Linking, Image, Platform, InteractionManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../stores';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { uploadFile, updateProfile as updateProfileApi } from '../../services/api';
import { useTheme } from '../../hooks/useTheme';

function genderLabel(g: 'male' | 'female' | 'unknown' | undefined) {
  if (g === 'male') return '男';
  if (g === 'female') return '女';
  return '未知';
}

export default function UserInfoScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((s) => s.isDarkMode);
  const { user, isLoggedIn, updateUser, clearAuth } = useAuthStore();
  const { primary, textMuted } = useTheme();
  
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

  const handlePickerAction = (type: 'camera' | 'library') => {
    if (Platform.OS === 'ios') {
      // iOS: 使用原来的方式（pendingPicker + onDismiss）
      setPendingPicker(type);
      setShowAvatarSheet(false);
    } else {
      // Android: 使用 setTimeout 延迟执行
      setShowAvatarSheet(false);
      setTimeout(() => {
        if (type === 'camera') {
          pickFromCamera();
        } else {
          pickFromLibrary();
        }
      }, 300);
    }
  };

  const pickFromLibrary = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!perm.granted) {
        if (!perm.canAskAgain) {
          Alert.alert('权限已关闭', '请在系统设置中允许访问相册', [
            { text: '取消', style: 'cancel' },
            { text: '去设置', onPress: () => Linking.openSettings() },
          ]);
        } else {
          Alert.alert('需要权限', '请允许访问相册以选择头像');
        }
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled) return;
      
      const asset = result.assets?.[0];
      if (!asset?.uri) return;
      
      await uploadAvatar(asset.uri);
    } catch (error) {
      console.error('选择相册失败:', error);
      Alert.alert('错误', `选择相册失败: ${error}`);
    }
  };

  const pickFromCamera = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!perm.granted) {
        if (!perm.canAskAgain) {
          Alert.alert('权限已关闭', '请在系统设置中允许使用相机', [
            { text: '取消', style: 'cancel' },
            { text: '去设置', onPress: () => Linking.openSettings() },
          ]);
        } else {
          Alert.alert('需要权限', '请允许使用相机以拍摄头像');
        }
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled) return;
      
      const asset = result.assets?.[0];
      if (!asset?.uri) return;
      
      await uploadAvatar(asset.uri);
    } catch (error) {
      console.error('拍照失败:', error);
      Alert.alert('错误', `拍照失败: ${error}`);
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
      Alert.alert('上传失败', '头像上传失败，请稍后重试');
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
      Alert.alert('成功', '个人信息已更新', [
        {
          text: '知道了',
          onPress: () => router.replace('/(tabs)/profile'),
        },
      ]);
    } catch (error: any) {
      console.error('更新失败:', error);
      Alert.alert('保存失败', '个人信息保存失败，请稍后重试');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView className="flex-1 bg-appBg dark:bg-appDarkBg items-center justify-center px-6">
        <Text className="text-[14px] font-semibold text-appMuted dark:text-appDarkMuted">
          请先登录
        </Text>
        <Pressable
          onPress={() => router.push('/auth/login')}
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          className="mt-4 px-4 py-3 rounded-[18px] bg-primary"
        >
          <Text className="text-white dark:text-appText font-extrabold">去登录</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-appBg dark:bg-appDarkBg">
      <View className="px-5 pt-2 pb-4">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
            className="w-10 h-10 rounded-2xl bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder items-center justify-center"
          >
            <Ionicons name="arrow-back" size={18} color={textMuted} />
          </Pressable>
          <Text className="text-base font-extrabold text-appText dark:text-appDarkText">
            用户信息
          </Text>
          <Pressable
            onPress={handleSave}
            disabled={!hasChanges || saving}
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
            className={`px-4 h-10 rounded-2xl items-center justify-center ${
              hasChanges && !saving ? 'bg-primary' : 'bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder'
            }`}
          >
            <Text className={`text-sm font-extrabold ${
              hasChanges && !saving ? 'text-white dark:text-appText' : 'text-appMuted dark:text-appDarkMuted'
            }`}>
              {saving ? '保存中...' : '保存'}
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
      >
        <View className="items-center py-4">
          <Pressable 
            onPress={() => setShowAvatarSheet(true)} 
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
            disabled={uploading}
          >
            <View className="w-24 h-24 rounded-full bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder items-center justify-center overflow-hidden">
              {draftAvatarUrl ? (
                <Image 
                  source={{ uri: draftAvatarUrl }} 
                  className="w-full h-full" 
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="person" size={42} color={textMuted} />
              )}
              {uploading && (
                <View className="absolute inset-0 bg-black/50 items-center justify-center">
                  <Text className="text-white text-xs">上传中...</Text>
                </View>
              )}
            </View>
            <View className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-appCard dark:bg-appDarkCard items-center justify-center border-4 border-appBg dark:border-appDarkBg">
              <Ionicons name="camera" size={14} color={textMuted} />
            </View>
          </Pressable>
        </View>

        <View className="bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder rounded-[18px] overflow-hidden">
          <View className="px-4 py-4 flex-row items-center justify-between border-b border-appBorder dark:border-appDarkBorder">
            <Text className="text-[14px] font-extrabold text-appText dark:text-appDarkText">昵称</Text>
            <View className="flex-1 ml-4">
              <TextInput
                value={draftName}
                onChangeText={(text) => { setDraftName(text); setHasChanges(true); }}
                placeholder="输入昵称"
                className="text-right text-[14px] font-semibold text-appText dark:text-appDarkText"
                placeholderTextColor={isDarkMode ? '#a8a29e' : '#a8a29e'}
              />
            </View>
          </View>

          <Pressable
            onPress={() => setShowGenderSheet(true)}
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
            className="px-4 py-4 flex-row items-center justify-between border-b border-appBorder dark:border-appDarkBorder"
          >
            <Text className="text-[14px] font-extrabold text-appText dark:text-appDarkText">性别</Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-[14px] font-semibold text-appMuted dark:text-appDarkMuted">
                {genderLabel(draftGender)}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#44403c' : '#d6d3d1'} />
            </View>
          </Pressable>

          <View className="px-4 py-4 flex-row items-center justify-between border-b border-appBorder dark:border-appDarkBorder">
            <Text className="text-[14px] font-extrabold text-appText dark:text-appDarkText">账号</Text>
            <Text className="text-[14px] font-semibold text-appMuted dark:text-appDarkMuted">
              {identifierText}
            </Text>
          </View>

          <View className="px-4 py-4 flex-row items-center justify-between border-b border-appBorder dark:border-appDarkBorder">
            <Text className="text-[14px] font-extrabold text-appText dark:text-appDarkText">会员</Text>
            <Text className="text-[14px] font-semibold text-appMuted dark:text-appDarkMuted">
              未开通
            </Text>
          </View>

          <Pressable
            onPress={() => Alert.alert('提示', '功能开发中')}
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
            className="px-4 py-4 flex-row items-center justify-between"
          >
            <Text className="text-[14px] font-extrabold text-appText dark:text-appDarkText">账户安全</Text>
            <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#44403c' : '#d6d3d1'} />
          </Pressable>
        </View>

        <Pressable
          onPress={() => { logout(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); router.back(); }}
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          className="mt-6 py-4 rounded-[18px] bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 items-center"
        >
          <Text className="text-red-500 font-extrabold">退出登录</Text>
        </Pressable>
      </ScrollView>

      <BottomSheet
        visible={showAvatarSheet}
        title="选择头像"
        onClose={() => setShowAvatarSheet(false)}
        onDismiss={Platform.OS === 'ios' ? handleAvatarSheetDismiss : undefined}
      >
        <View className="px-5 pb-8">
          <Pressable
            onPress={() => handlePickerAction('camera')}
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
            className="py-4 rounded-[18px] bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder items-center"
          >
            <Text className="text-appText dark:text-appDarkText font-extrabold">拍照</Text>
          </Pressable>

          <Pressable
            onPress={() => handlePickerAction('library')}
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
            className="mt-3 py-4 rounded-[18px] bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder items-center"
          >
            <Text className="text-appText dark:text-appDarkText font-extrabold">从相册选择</Text>
          </Pressable>

          <Pressable
            onPress={() => setShowAvatarSheet(false)}
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
            className="mt-3 py-4 rounded-[18px] bg-primary items-center"
          >
            <Text className="text-white dark:text-appText font-extrabold">取消</Text>
          </Pressable>
        </View>
      </BottomSheet>

      <BottomSheet
        visible={showGenderSheet}
        title="选择性别"
        onClose={() => setShowGenderSheet(false)}
      >
        <View className="px-5 pb-8 gap-3">
          {(['male', 'female', 'unknown'] as const).map((g) => (
            <Pressable
              key={g}
              onPress={() => { setDraftGender(g); setHasChanges(true); setShowGenderSheet(false); Haptics.selectionAsync(); }}
              style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
              className="py-4 rounded-[18px] bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder flex-row items-center justify-between px-4"
            >
              <Text className="text-appText dark:text-appDarkText font-extrabold">
                {genderLabel(g)}
              </Text>
              {draftGender === g && (
                <Ionicons name="checkmark" size={18} color={primary} />
              )}
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

