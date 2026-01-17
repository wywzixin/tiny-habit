import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useUserStore } from '../../stores';
import { BottomSheet } from '../../components/ui/BottomSheet';

function genderLabel(g: 'male' | 'female' | 'unknown' | undefined) {
  if (g === 'male') return '男';
  if (g === 'female') return '女';
  return '未知';
}

export default function UserInfoScreen() {
  const router = useRouter();
  const isDarkMode = useUserStore((s) => s.isDarkMode);
  const { user, isLoggedIn, logout, updateProfile } = useUserStore();

  const [showAvatarSheet, setShowAvatarSheet] = useState(false);
  const [showNameSheet, setShowNameSheet] = useState(false);
  const [showGenderSheet, setShowGenderSheet] = useState(false);

  const [draftName, setDraftName] = useState(user?.displayName || '');

  const identifierText = useMemo(() => {
    if (!user) return '';
    return user.email || user.phone || user.identifier || '';
  }, [user]);

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('需要权限', '请允许访问相册以选择头像');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled) return;
    const asset = result.assets?.[0];
    if (!asset?.uri) return;
    updateProfile({ avatarUri: asset.uri });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const pickFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('需要权限', '请允许使用相机以拍摄头像');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled) return;
    const asset = result.assets?.[0];
    if (!asset?.uri) return;
    updateProfile({ avatarUri: asset.uri });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSaveName = () => {
    const name = draftName.trim();
    if (!name) return;
    updateProfile({ displayName: name });
    setShowNameSheet(false);
    Haptics.selectionAsync();
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView className="flex-1 bg-appBg dark:bg-appDarkBg items-center justify-center px-6">
        <Text className="text-[14px] font-semibold text-appMuted dark:text-appDarkMuted">
          请先登录
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/auth/login')}
          activeOpacity={0.85}
          className="mt-4 px-4 py-3 rounded-[22px] bg-appText dark:bg-appDarkText"
        >
          <Text className="text-white dark:text-appText font-extrabold">去登录</Text>
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
            用户信息
          </Text>
          <View className="w-10 h-10" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
      >
        <View className="items-center py-4">
          <TouchableOpacity onPress={() => setShowAvatarSheet(true)} activeOpacity={0.85}>
            <View className="w-24 h-24 rounded-full bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder items-center justify-center overflow-hidden">
              {user?.avatarUri ? (
                <Image source={{ uri: user.avatarUri }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <Ionicons name="person" size={42} color={isDarkMode ? '#a8a29e' : '#78716c'} />
              )}
            </View>
            <View className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-appText dark:bg-appDarkText items-center justify-center border-4 border-appBg dark:border-appDarkBg">
              <Ionicons name="camera" size={14} color={isDarkMode ? '#0c0a09' : 'white'} />
            </View>
          </TouchableOpacity>
        </View>

        <View className="bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder rounded-[22px] overflow-hidden">
          <TouchableOpacity
            onPress={() => { setDraftName(user?.displayName || ''); setShowNameSheet(true); }}
            activeOpacity={0.85}
            className="px-4 py-4 flex-row items-center justify-between border-b border-appBorder dark:border-appDarkBorder"
          >
            <Text className="text-[14px] font-extrabold text-appText dark:text-appDarkText">昵称</Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-[14px] font-semibold text-appMuted dark:text-appDarkMuted">
                {user?.displayName || ''}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#44403c' : '#d6d3d1'} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowGenderSheet(true)}
            activeOpacity={0.85}
            className="px-4 py-4 flex-row items-center justify-between border-b border-appBorder dark:border-appDarkBorder"
          >
            <Text className="text-[14px] font-extrabold text-appText dark:text-appDarkText">性别</Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-[14px] font-semibold text-appMuted dark:text-appDarkMuted">
                {genderLabel(user?.gender)}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#44403c' : '#d6d3d1'} />
            </View>
          </TouchableOpacity>

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

          <TouchableOpacity
            onPress={() => Alert.alert('提示', '功能开发中')}
            activeOpacity={0.85}
            className="px-4 py-4 flex-row items-center justify-between"
          >
            <Text className="text-[14px] font-extrabold text-appText dark:text-appDarkText">账户安全</Text>
            <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#44403c' : '#d6d3d1'} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => { logout(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); router.back(); }}
          activeOpacity={0.85}
          className="mt-6 py-4 rounded-[22px] bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder items-center"
        >
          <Text className="text-red-500 font-extrabold">退出登录</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomSheet
        visible={showAvatarSheet}
        title="选择头像"
        onClose={() => setShowAvatarSheet(false)}
      >
        <View className="px-5 pb-8">
          <TouchableOpacity
            onPress={async () => { setShowAvatarSheet(false); await pickFromCamera(); }}
            activeOpacity={0.85}
            className="py-4 rounded-[22px] bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder items-center"
          >
            <Text className="text-appText dark:text-appDarkText font-extrabold">拍照</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => { setShowAvatarSheet(false); await pickFromLibrary(); }}
            activeOpacity={0.85}
            className="mt-3 py-4 rounded-[22px] bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder items-center"
          >
            <Text className="text-appText dark:text-appDarkText font-extrabold">从相册选择</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowAvatarSheet(false)}
            activeOpacity={0.85}
            className="mt-3 py-4 rounded-[22px] bg-appText dark:bg-appDarkText items-center"
          >
            <Text className="text-white dark:text-appText font-extrabold">取消</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      <BottomSheet
        visible={showNameSheet}
        title="修改昵称"
        onClose={() => setShowNameSheet(false)}
        rightLabel="保存"
        onRightPress={handleSaveName}
      >
        <View className="px-5 pb-8">
          <View className="bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder rounded-[22px] px-4 h-[56px] flex-row items-center">
            <Ionicons name="text-outline" size={18} color={isDarkMode ? '#a8a29e' : '#78716c'} />
            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              placeholder="输入昵称"
              className="flex-1 ml-2 h-full text-[14px] font-semibold text-appText dark:text-appDarkText"
              placeholderTextColor={isDarkMode ? '#a8a29e' : '#a8a29e'}
              returnKeyType="done"
              onSubmitEditing={handleSaveName}
            />
          </View>
        </View>
      </BottomSheet>

      <BottomSheet
        visible={showGenderSheet}
        title="选择性别"
        onClose={() => setShowGenderSheet(false)}
      >
        <View className="px-5 pb-8 gap-3">
          {(['male', 'female', 'unknown'] as const).map((g) => (
            <TouchableOpacity
              key={g}
              onPress={() => { updateProfile({ gender: g }); setShowGenderSheet(false); Haptics.selectionAsync(); }}
              activeOpacity={0.85}
              className="py-4 rounded-[22px] bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder flex-row items-center justify-between px-4"
            >
              <Text className="text-appText dark:text-appDarkText font-extrabold">
                {genderLabel(g)}
              </Text>
              {user?.gender === g && (
                <Ionicons name="checkmark" size={18} color="#10B981" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

