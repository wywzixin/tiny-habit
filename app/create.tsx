import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useHabitStore, useUserStore } from '../stores';
import { celebrations, weekDays } from '../constants';
import { BottomSheet } from '../components/ui/BottomSheet';

// 习惯库分类
const habitCategories = ['全部', '新建', '推荐', '健康', '学习', '生活', '心理', '社交'];

// 习惯库数据
const habitLibrary = [
  { name: '多喝水', desc: '每天8杯水，保持水分', icon: '💧', iconBg: '#CFFAFE', category: '健康' },
  { name: '坚持运动', desc: '强身健体，活力满满', icon: '💪', iconBg: '#D1FAE5', category: '健康' },
  { name: '早睡早起', desc: '规律作息，精神饱满', icon: '🌅', iconBg: '#FEF3C7', category: '健康' },
  { name: '阅读', desc: '开卷有益，增长见识', icon: '📖', iconBg: '#FEF3C7', category: '学习' },
  { name: '冥想', desc: '静心养神，提升专注', icon: '🧘', iconBg: '#FCE7F3', category: '心理' },
  { name: '写日记', desc: '记录生活，整理思绪', icon: '📝', iconBg: '#DBEAFE', category: '心理' },
  { name: '整理房间', desc: '整洁环境，清爽心情', icon: '🏠', iconBg: '#DBEAFE', category: '生活' },
  { name: '记账', desc: '理财有道，心中有数', icon: '💰', iconBg: '#FEF3C7', category: '生活' },
  { name: '学英语', desc: '每天进步一点点', icon: '🔤', iconBg: '#DBEAFE', category: '学习' },
  { name: '健康饮食', desc: '均衡营养，身体棒棒', icon: '🥗', iconBg: '#D1FAE5', category: '健康' },
  { name: '每天运动30分钟', desc: '增强体质，保持活力', icon: '🏃', iconBg: '#D1FAE5', category: '推荐' },
  { name: '每周读完1本书', desc: '持续学习，拓展视野', icon: '📚', iconBg: '#FEF3C7', category: '推荐' },
  { name: '每周约见朋友', desc: '维系友情，社交充电', icon: '👥', iconBg: '#DBEAFE', category: '社交' },
  { name: '感恩日记', desc: '感恩生活，积极心态', icon: '🙏', iconBg: '#D1FAE5', category: '心理' },
];

const aiRecommendations = {
  behaviors: [
    { text: '喝一口水', difficulty: 'easy', icon: '💧' },
    { text: '喝半杯水', difficulty: 'easy', icon: '🥤' },
    { text: '喝一杯水', difficulty: 'medium', icon: '🫗' },
  ],
  anchors: [
    { text: '起床后', icon: '🛏️' },
    { text: '到公司后', icon: '💼' },
    { text: '吃完饭后', icon: '🍚' },
  ],
};

export default function CreateScreen() {
  const router = useRouter();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const editingId = typeof editId === 'string' ? editId : undefined;

  const {
    microBehaviors,
    addMicroBehavior,
    updateMicroBehavior,
    userHabitTemplates,
    addUserHabitTemplate,
    deleteUserHabitTemplate,
  } = useHabitStore();
  const isDarkMode = useUserStore((state) => state.isDarkMode);

  const [goal, setGoal] = useState('');
  const [behavior, setBehavior] = useState('');
  const [anchor, setAnchor] = useState('');
  const [celebration, setCelebration] = useState('');
  const [frequency, setFrequency] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  // 习惯库弹窗状态
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryCategory, setLibraryCategory] = useState('全部');
  const [librarySearch, setLibrarySearch] = useState('');

  // 提醒功能状态
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date(2026, 0, 1, 8, 0));
  const [showTimePicker, setShowTimePicker] = useState(false);

  const todayLabel = new Date().toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  const formatTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const editingBehavior = useMemo(() => {
    if (!editingId) return undefined;
    return microBehaviors.find((b) => b.id === editingId);
  }, [editingId, microBehaviors]);

  useEffect(() => {
    if (!editingId) return;
    if (!editingBehavior) return;

    setGoal(editingBehavior.name || '');
    setBehavior(editingBehavior.behavior || '');
    setAnchor(editingBehavior.anchor || '');
    setCelebration(editingBehavior.celebration || '');
    setFrequency(editingBehavior.frequency?.length ? editingBehavior.frequency : [0, 1, 2, 3, 4, 5, 6]);

    const t = editingBehavior.reminderTime;
    if (t && /^\d{2}:\d{2}$/.test(t)) {
      const [hh, mm] = t.split(':').map((x) => Number(x));
      const d = new Date();
      d.setHours(hh);
      d.setMinutes(mm);
      d.setSeconds(0);
      d.setMilliseconds(0);
      setReminderTime(d);
      setReminderEnabled(true);
    } else {
      setReminderEnabled(Boolean(editingBehavior.reminderEnabled));
    }
  }, [editingBehavior, editingId]);

  const onTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedDate) {
      setReminderTime(selectedDate);
    }
  };

  const canCreate = behavior && anchor && celebration && frequency.length > 0;

  const systemHabits = habitLibrary.map((h, idx) => ({
    id: `sys-${idx}`,
    ...h,
    source: 'system' as const,
  }));
  const myHabits = userHabitTemplates.map((h) => ({
    id: h.id,
    name: h.name,
    desc: h.desc,
    icon: h.icon,
    iconBg: h.iconBg,
    category: '新建',
    source: 'user' as const,
  }));

  const baseHabits =
    libraryCategory === '新建'
      ? myHabits
      : libraryCategory === '全部'
        ? [...myHabits, ...systemHabits]
        : systemHabits.filter((h) => h.category === libraryCategory);

  const displayedHabits = baseHabits.filter((h) => {
    const q = librarySearch.trim();
    if (!q) return true;
    return h.name.includes(q) || h.desc.includes(q);
  });

  const selectHabitFromLibrary = (name: string) => {
    setGoal(name);
    setLibrarySearch('');
    setShowLibrary(false);
    Haptics.selectionAsync();
  };

  const toggleDay = (day: number) => {
    Haptics.selectionAsync();
    setFrequency((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleDeleteUserHabit = (id: string, name: string) => {
    Alert.alert('删除习惯', `确定删除“${name}”吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          deleteUserHabitTemplate(id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const handleCreate = () => {
    if (!canCreate) return;

    addMicroBehavior({
      habitId: Date.now().toString(),
      name: behavior,
      icon: '✨',
      anchor,
      behavior,
      celebration,
      difficulty: 'easy',
      frequency,
      reminderEnabled,
      reminderTime: reminderEnabled ? formatTime(reminderTime) : undefined,
      sortOrder: 0,
      isActive: true,
    });

    const goalName = goal.trim();
    if (goalName) {
      const isSystem = systemHabits.some((h) => h.name.trim() === goalName);
      if (!isSystem) addUserHabitTemplate(goalName);
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const handleUpdate = () => {
    if (!editingId) return;
    if (!editingBehavior) return;
    if (!canCreate) return;

    updateMicroBehavior(editingId, {
      name: goal.trim() || behavior.trim(),
      anchor,
      behavior,
      celebration,
      frequency,
      reminderEnabled,
      reminderTime: reminderEnabled ? formatTime(reminderTime) : undefined,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const handleSubmit = editingId ? handleUpdate : handleCreate;

  return (
    <SafeAreaView className="flex-1 bg-appBg dark:bg-appDarkBg">
      {/* Header */}
      <View className="px-5 pt-2 pb-3">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.85}
            className="px-3 py-2 rounded-2xl bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder"
          >
            <Text className="text-appMuted dark:text-appDarkMuted text-[12px] font-bold">取消</Text>
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted">
              {todayLabel}
            </Text>
            <Text className="text-base font-extrabold text-appText dark:text-appDarkText mt-0.5">
              {editingId ? '编辑配方' : '新建配方'}
            </Text>
          </View>

          {editingId ? (
            <TouchableOpacity
              onPress={handleUpdate}
              activeOpacity={0.85}
              className={`px-3 py-2 rounded-2xl ${
                canCreate ? 'bg-appText dark:bg-appDarkText' : 'bg-appBorder dark:bg-appDarkBorder'
              }`}
              disabled={!canCreate}
            >
              <Text className={`text-[12px] font-extrabold ${
                canCreate ? 'text-white dark:text-appText' : 'text-appMuted dark:text-appDarkMuted'
              }`}>
                保存
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="w-12" />
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}
      >
        {/* Goal Input */}
        <View className="mb-8">
          <Text className="text-lg font-extrabold text-appText dark:text-appDarkText mb-1">
            🎯 你想养成什么习惯？
          </Text>
          <Text className="text-sm font-semibold text-appMuted dark:text-appDarkMuted mb-3">
            输入目标后，AI 会推荐微行为和触发时机
          </Text>
          <View className="bg-appCard dark:bg-appDarkCard px-4 py-3 rounded-[22px] border border-appBorder dark:border-appDarkBorder">
            <View className="flex-row items-center">
              <Ionicons name="search" size={18} color={isDarkMode ? '#a8a29e' : '#78716c'} />
            <TextInput
              value={goal}
              onChangeText={setGoal}
              placeholder="例如：多喝水、运动、早起..."
              className="flex-1 ml-2 text-[14px] font-semibold text-appText dark:text-appDarkText"
              placeholderTextColor={isDarkMode ? '#a8a29e' : '#a8a29e'}
            />
            <TouchableOpacity
              onPress={() => setShowLibrary(true)}
              activeOpacity={0.85}
              className="px-3 py-2 bg-appText dark:bg-appDarkText rounded-2xl flex-row items-center"
            >
              <Ionicons name="book-outline" size={14} color={isDarkMode ? '#0c0a09' : 'white'} />
              <Text className="text-xs font-bold text-white dark:text-appText ml-1">习惯库</Text>
            </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Behavior Selection */}
        <View className="mb-8">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-lg font-extrabold text-appText dark:text-appDarkText">⚡ 选择微行为</Text>
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}
            >
              <Text className="text-[10px] font-bold text-white">AI 推荐</Text>
            </LinearGradient>
          </View>
          <Text className="text-sm font-semibold text-appMuted dark:text-appDarkMuted mb-3">越小越容易坚持</Text>
          <View className="gap-2 mb-3">
            {aiRecommendations.behaviors.map((item) => (
              <TouchableOpacity
                key={item.text}
                onPress={() => { setBehavior(item.text); Haptics.selectionAsync(); }}
                activeOpacity={0.88}
                className={`p-4 rounded-[22px] border flex-row items-center ${
                  behavior === item.text
                    ? 'bg-primary/10 dark:bg-primary/15 border-primary/25 dark:border-primary/30'
                    : 'bg-appCard dark:bg-appDarkCard border-appBorder dark:border-appDarkBorder'
                }`}
              >
                <View className="w-12 h-12 rounded-[16px] bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder items-center justify-center mr-3">
                  <Text className="text-[22px]">{item.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-extrabold text-appText dark:text-appDarkText">{item.text}</Text>
                  <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted mt-1">
                    {item.difficulty === 'easy' ? '简单 · 30 秒内完成' : item.difficulty === 'medium' ? '适中 · 1 分钟内完成' : '挑战 · 2 分钟内完成'}
                  </Text>
                </View>
                {behavior === item.text && (
                  <View className="w-9 h-9 rounded-full bg-primary items-center justify-center">
                    <Ionicons name="checkmark" size={18} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            value={behavior}
            onChangeText={setBehavior}
            placeholder="或自己输入微行为..."
            className="bg-appCard dark:bg-appDarkCard px-4 py-4 rounded-[22px] border border-appBorder dark:border-appDarkBorder text-[14px] font-semibold text-appText dark:text-appDarkText"
            placeholderTextColor={isDarkMode ? '#a8a29e' : '#a8a29e'}
          />
        </View>

        {/* Anchor Selection */}
        <View className="mb-8">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-lg font-extrabold text-appText dark:text-appDarkText">⏰ 什么时候做？</Text>
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}
            >
              <Text className="text-[10px] font-bold text-white">AI 推荐</Text>
            </LinearGradient>
          </View>
          <Text className="text-sm font-semibold text-appMuted dark:text-appDarkMuted mb-3">选择一个每天必做的事作为触发点</Text>
          <View className="gap-2 mb-3">
            {aiRecommendations.anchors.map((item) => (
              <TouchableOpacity
                key={item.text}
                onPress={() => { setAnchor(item.text); Haptics.selectionAsync(); }}
                activeOpacity={0.88}
                className={`p-4 rounded-[22px] border flex-row items-center ${
                  anchor === item.text
                    ? 'bg-primary/10 dark:bg-primary/15 border-primary/25 dark:border-primary/30'
                    : 'bg-appCard dark:bg-appDarkCard border-appBorder dark:border-appDarkBorder'
                }`}
              >
                <View className="w-12 h-12 rounded-[16px] bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder items-center justify-center mr-3">
                  <Text className="text-[22px]">{item.icon}</Text>
                </View>
                <Text className="flex-1 text-[15px] font-extrabold text-appText dark:text-appDarkText">{item.text}</Text>
                {anchor === item.text && (
                  <View className="w-9 h-9 rounded-full bg-primary items-center justify-center">
                    <Ionicons name="checkmark" size={18} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            value={anchor}
            onChangeText={setAnchor}
            placeholder="或自己输入触发时机..."
            className="bg-appCard dark:bg-appDarkCard px-4 py-4 rounded-[22px] border border-appBorder dark:border-appDarkBorder text-[14px] font-semibold text-appText dark:text-appDarkText"
            placeholderTextColor={isDarkMode ? '#a8a29e' : '#a8a29e'}
          />
        </View>

        {/* Celebration */}
        <View className="mb-8">
          <Text className="text-lg font-extrabold text-appText dark:text-appDarkText mb-1">🎉 完成后庆祝</Text>
          <Text className="text-sm font-semibold text-appMuted dark:text-appDarkMuted mb-3">即时的正向反馈帮助固化习惯</Text>
          <View className="flex-row flex-wrap gap-2">
            {celebrations.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => { setCelebration(item.text); Haptics.selectionAsync(); }}
                activeOpacity={0.88}
                className={`p-3 rounded-[20px] border items-center w-[31%] ${
                  celebration === item.text
                    ? 'bg-primary/10 dark:bg-primary/15 border-primary/25 dark:border-primary/30'
                    : 'bg-appCard dark:bg-appDarkCard border-appBorder dark:border-appDarkBorder'
                }`}
              >
                <Text className="text-2xl mb-1">{item.emoji}</Text>
                <Text className="text-[11px] font-bold text-appMuted dark:text-appDarkMuted">{item.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Frequency */}
        <View className="mb-8">
          <Text className="text-lg font-extrabold text-appText dark:text-appDarkText mb-1">📅 打卡频率</Text>
          <Text className="text-sm font-semibold text-appMuted dark:text-appDarkMuted mb-3">选择每周需要打卡的日子</Text>
          <View className="flex-row justify-between mb-1">
            {weekDays.map((day, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => toggleDay(index)}
                activeOpacity={0.85}
                className={`w-10 h-10 rounded-full items-center justify-center border ${
                  frequency.includes(index)
                    ? 'bg-appText dark:bg-appDarkText border-appText dark:border-appDarkText'
                    : 'bg-appCard dark:bg-appDarkCard border-appBorder dark:border-appDarkBorder'
                }`}
              >
                <Text className={`text-sm font-extrabold ${
                  frequency.includes(index) ? 'text-white dark:text-appText' : 'text-appMuted dark:text-appDarkMuted'
                }`}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reminder */}
        <View className="mb-8">
          <Text className="text-lg font-extrabold text-appText dark:text-appDarkText mb-1">🔔 提醒设置</Text>
          <Text className="text-sm font-semibold text-appMuted dark:text-appDarkMuted mb-3">开启提醒帮助你记住打卡</Text>
          <View className="bg-appCard dark:bg-appDarkCard p-4 rounded-[22px] border border-appBorder dark:border-appDarkBorder">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-[14px] font-extrabold text-appText dark:text-appDarkText">开启提醒</Text>
                <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted mt-1">
                  仅记录时间，通知推送待接入
                </Text>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{ false: '#e7e5e4', true: '#10B981' }}
                thumbColor="white"
              />
            </View>
            {reminderEnabled && (
              <View className="mt-4 pt-4 border-t border-appBorder dark:border-appDarkBorder">
                <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted mb-2">提醒时间</Text>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  activeOpacity={0.85}
                  className="bg-appBg dark:bg-appDarkBg px-4 py-3 rounded-2xl flex-row items-center justify-between border border-appBorder dark:border-appDarkBorder"
                >
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="time-outline" size={18} color="#10B981" />
                    <Text className="text-[15px] font-extrabold text-appText dark:text-appDarkText">
                      {formatTime(reminderTime)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#a8a29e" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Preview & Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-appBg dark:bg-appDarkBg border-t border-appBorder dark:border-appDarkBorder px-5 pt-3 pb-8">
        <View className="bg-appCard dark:bg-appDarkCard p-4 rounded-[22px] border border-appBorder dark:border-appDarkBorder mb-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[11px] font-extrabold text-appMuted dark:text-appDarkMuted">我的配方预览</Text>
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="sparkles" size={14} color="#10B981" />
              <Text className="text-[11px] font-extrabold text-primary">B = MAP</Text>
            </View>
          </View>
          <Text className="text-[14px] font-semibold text-appText dark:text-appDarkText leading-relaxed">
            当 <Text className={anchor ? 'text-primary font-extrabold' : 'text-appMuted dark:text-appDarkMuted'}>{anchor || '___'}</Text> 后，
            我会 <Text className={behavior ? 'text-primary font-extrabold' : 'text-appMuted dark:text-appDarkMuted'}>{behavior || '___'}</Text>，
            然后 <Text className={celebration ? 'text-primary font-extrabold' : 'text-appMuted dark:text-appDarkMuted'}>{celebration || '___'}</Text>
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canCreate}
          activeOpacity={0.9}
          className={`py-4 rounded-[22px] items-center ${
            canCreate ? 'bg-appText dark:bg-appDarkText' : 'bg-appBorder dark:bg-appDarkBorder'
          }`}
        >
          <Text className={`font-extrabold text-base ${canCreate ? 'text-white dark:text-appText' : 'text-appMuted dark:text-appDarkMuted'}`}>
            {editingId ? '保存修改' : '确认创建'}
          </Text>
        </TouchableOpacity>
      </View>

      <BottomSheet
        visible={showLibrary}
        title="选择一个习惯目标"
        onClose={() => { setShowLibrary(false); setLibrarySearch(''); }}
        height="85%"
      >
        <View className="px-4 pb-4">
          <View className="mt-2 rounded-[22px] bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder px-4 py-3 flex-row items-center">
            <Ionicons name="search" size={18} color={isDarkMode ? '#a8a29e' : '#78716c'} />
            <TextInput
              value={librarySearch}
              onChangeText={setLibrarySearch}
              placeholder="搜索习惯名称或描述..."
              className="flex-1 ml-2 text-[14px] font-semibold text-appText dark:text-appDarkText"
              placeholderTextColor={isDarkMode ? '#a8a29e' : '#a8a29e'}
              returnKeyType="search"
            />
            {librarySearch.trim().length > 0 && (
              <TouchableOpacity
                onPress={() => setLibrarySearch('')}
                activeOpacity={0.85}
                className="w-8 h-8 rounded-full bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder items-center justify-center"
              >
                <Ionicons name="close" size={16} color={isDarkMode ? '#d6d3d1' : '#78716c'} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
            <View className="flex-row gap-2 pr-3">
              {habitCategories.map((cat) => {
                const active = libraryCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => { setLibraryCategory(cat); Haptics.selectionAsync(); }}
                    activeOpacity={0.85}
                    className={`px-4 py-2 rounded-full border ${
                      active
                        ? 'bg-appText dark:bg-appDarkText border-appText dark:border-appDarkText'
                        : 'bg-appCard dark:bg-appDarkCard border-appBorder dark:border-appDarkBorder'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        active ? 'text-white dark:text-appText' : 'text-appMuted dark:text-appDarkMuted'
                      }`}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View className="flex-row items-center justify-between mt-4">
            <Text className="text-[12px] font-extrabold text-appText dark:text-appDarkText">
              {libraryCategory === '新建' ? '我创建的' : libraryCategory === '全部' ? '全部习惯' : '系统推荐'}
            </Text>
            <View className="px-3 py-1.5 rounded-full bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder">
              <Text className="text-[11px] font-bold text-appMuted dark:text-appDarkMuted">
                {displayedHabits.length} 条
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        >
          <View className="gap-3">
            {displayedHabits.length === 0 ? (
              <View className="bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder rounded-[22px] p-8 items-center">
                <Text className="text-4xl mb-3">🔎</Text>
                <Text className="text-sm font-extrabold text-appText dark:text-appDarkText">
                  没找到相关习惯
                </Text>
                <Text className="text-xs font-semibold text-appMuted dark:text-appDarkMuted mt-2 text-center leading-relaxed">
                  换个关键词试试，或选择其他分类
                </Text>
                <TouchableOpacity
                  onPress={() => setLibrarySearch('')}
                  activeOpacity={0.85}
                  className="mt-5 px-4 py-3 rounded-2xl bg-appText dark:bg-appDarkText"
                >
                  <Text className="text-white dark:text-appText font-extrabold">
                    清空搜索
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              displayedHabits.map((habit) => {
                const selected = goal === habit.name;
                return (
                  <TouchableOpacity
                    key={habit.id}
                    onPress={() => selectHabitFromLibrary(habit.name)}
                    activeOpacity={0.92}
                    className={`p-4 rounded-[22px] border flex-row items-center ${
                      selected
                        ? 'bg-primary/10 dark:bg-primary/15 border-primary/25 dark:border-primary/30'
                        : 'bg-appCard dark:bg-appDarkCard border-appBorder dark:border-appDarkBorder'
                    }`}
                  >
                    <View
                      className="w-12 h-12 rounded-[16px] items-center justify-center mr-3 border border-appBorder dark:border-appDarkBorder"
                      style={{ backgroundColor: habit.iconBg }}
                    >
                      <Text className="text-[22px]">{habit.icon}</Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-[15px] font-extrabold text-appText dark:text-appDarkText">
                          {habit.name}
                        </Text>
                        <View className="px-2.5 py-1 rounded-full bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder">
                          <Text className="text-[11px] font-bold text-appMuted dark:text-appDarkMuted">
                            {habit.category}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted mt-2">
                        {habit.desc}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <View className={`w-10 h-10 rounded-full items-center justify-center border ${
                        selected
                          ? 'bg-primary border-primary'
                          : 'bg-appBg dark:bg-appDarkBg border-appBorder dark:border-appDarkBorder'
                      }`}>
                        <Ionicons
                          name={selected ? 'checkmark' : 'add'}
                          size={20}
                          color={selected ? 'white' : (isDarkMode ? '#d6d3d1' : '#78716c')}
                        />
                      </View>
                      {habit.source === 'user' && (
                        <TouchableOpacity
                          onPress={() => handleDeleteUserHabit(habit.id, habit.name)}
                          activeOpacity={0.85}
                          className="w-10 h-10 rounded-full items-center justify-center border border-red-100 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10"
                        >
                          <Ionicons name="trash-outline" size={18} color="#ef4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>
      </BottomSheet>

      <BottomSheet
        visible={showTimePicker}
        title="选择提醒时间"
        onClose={() => setShowTimePicker(false)}
        leftLabel="取消"
        rightLabel="确定"
        height={300}
      >
        <View className="items-center py-2">
          <DateTimePicker
            value={reminderTime}
            mode="time"
            display="spinner"
            onChange={onTimeChange}
            locale="zh-CN"
            style={{ height: 200, width: '100%' }}
            themeVariant={isDarkMode ? 'dark' : 'light'}
          />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}
