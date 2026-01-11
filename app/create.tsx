import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useHabitStore, useUserStore } from '../stores';
import { celebrations, weekDays } from '../constants';

// 习惯库分类
const habitCategories = ['全部', '推荐', '健康', '学习', '生活', '心理', '社交'];

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
  const { addMicroBehavior } = useHabitStore();
  const isDarkMode = useUserStore((state) => state.isDarkMode);

  const [goal, setGoal] = useState('');
  const [behavior, setBehavior] = useState('');
  const [anchor, setAnchor] = useState('');
  const [celebration, setCelebration] = useState('');
  const [frequency, setFrequency] = useState<number[]>([1, 2, 3, 4, 5]);

  // 习惯库弹窗状态
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryCategory, setLibraryCategory] = useState('全部');

  // 提醒功能状态
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date(2026, 0, 1, 8, 0));
  const [showTimePicker, setShowTimePicker] = useState(false);

  const formatTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedDate) {
      setReminderTime(selectedDate);
    }
  };

  const canCreate = behavior && anchor && celebration && frequency.length > 0;

  // 筛选习惯库
  const filteredHabits = habitLibrary.filter(
    h => libraryCategory === '全部' || h.category === libraryCategory
  );

  const selectHabitFromLibrary = (name: string) => {
    setGoal(name);
    setShowLibrary(false);
    Haptics.selectionAsync();
  };

  const toggleDay = (day: number) => {
    Haptics.selectionAsync();
    setFrequency((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
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

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-50 dark:bg-stone-800">
      {/* Header */}
      <View className="px-5 py-3 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-stone-400 dark:text-stone-300 text-sm font-medium">取消</Text>
        </TouchableOpacity>
        <Text className="text-base font-bold text-stone-700 dark:text-stone-100">新建配方</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Goal Input */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-stone-700 dark:text-stone-100 mb-1">
            🎯 你想养成什么习惯？
          </Text>
          <Text className="text-sm text-stone-400 mb-3">
            输入目标后，AI 会推荐微行为和触发时机
          </Text>
          <View className="bg-white dark:bg-stone-700 p-1 rounded-[14px] border border-stone-200 dark:border-stone-600 flex-row items-center">
            <View className="w-10 h-10 items-center justify-center">
              <Ionicons name="search" size={20} color="#a8a29e" />
            </View>
            <TextInput
              value={goal}
              onChangeText={setGoal}
              placeholder="例如：多喝水、运动、早起..."
              className="flex-1 h-12 text-[15px] text-stone-700 dark:text-stone-100"
              placeholderTextColor="#a8a29e"
            />
            <TouchableOpacity
              onPress={() => setShowLibrary(true)}
              className="mr-1 px-3 py-2 bg-primary rounded-xl flex-row items-center"
            >
              <Ionicons name="book-outline" size={14} color="white" />
              <Text className="text-xs font-medium text-white ml-1">习惯库</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Behavior Selection */}
        <View className="mb-8">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-lg font-bold text-stone-700 dark:text-stone-100">⚡ 选择微行为</Text>
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}
            >
              <Text className="text-[10px] font-bold text-white">AI 推荐</Text>
            </LinearGradient>
          </View>
          <Text className="text-sm text-stone-400 mb-3">越小越容易坚持</Text>
          <View className="gap-2 mb-3">
            {aiRecommendations.behaviors.map((item) => (
              <TouchableOpacity
                key={item.text}
                onPress={() => { setBehavior(item.text); Haptics.selectionAsync(); }}
                className={`bg-white dark:bg-stone-700 p-3 rounded-xl border flex-row items-center ${
                  behavior === item.text ? 'border-primary bg-primary-light' : 'border-stone-200 dark:border-stone-600'
                }`}
              >
                <View className="w-11 h-11 rounded-xl bg-stone-50 dark:bg-stone-600 items-center justify-center mr-3">
                  <Text className="text-xl">{item.icon}</Text>
                </View>
                <Text className="flex-1 text-sm font-semibold text-stone-700 dark:text-stone-100">{item.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            value={behavior}
            onChangeText={setBehavior}
            placeholder="或自己输入微行为..."
            className="bg-white dark:bg-stone-700 p-3 rounded-xl border border-stone-200 dark:border-stone-600 text-sm text-stone-700 dark:text-stone-100"
            placeholderTextColor="#a8a29e"
          />
        </View>

        {/* Anchor Selection */}
        <View className="mb-8">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-lg font-bold text-stone-700 dark:text-stone-100">⏰ 什么时候做？</Text>
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}
            >
              <Text className="text-[10px] font-bold text-white">AI 推荐</Text>
            </LinearGradient>
          </View>
          <Text className="text-sm text-stone-400 mb-3">选择一个每天必做的事作为触发点</Text>
          <View className="gap-2 mb-3">
            {aiRecommendations.anchors.map((item) => (
              <TouchableOpacity
                key={item.text}
                onPress={() => { setAnchor(item.text); Haptics.selectionAsync(); }}
                className={`bg-white dark:bg-stone-700 p-3 rounded-xl border flex-row items-center ${
                  anchor === item.text ? 'border-primary bg-primary-light' : 'border-stone-200 dark:border-stone-600'
                }`}
              >
                <View className="w-11 h-11 rounded-xl bg-stone-50 dark:bg-stone-600 items-center justify-center mr-3">
                  <Text className="text-xl">{item.icon}</Text>
                </View>
                <Text className="flex-1 text-sm font-semibold text-stone-700 dark:text-stone-100">{item.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            value={anchor}
            onChangeText={setAnchor}
            placeholder="或自己输入触发时机..."
            className="bg-white dark:bg-stone-700 p-3 rounded-xl border border-stone-200 dark:border-stone-600 text-sm text-stone-700 dark:text-stone-100"
            placeholderTextColor="#a8a29e"
          />
        </View>

        {/* Celebration */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-stone-700 dark:text-stone-100 mb-1">🎉 完成后庆祝</Text>
          <Text className="text-sm text-stone-400 mb-3">即时的正向反馈帮助固化习惯</Text>
          <View className="flex-row flex-wrap gap-2">
            {celebrations.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => { setCelebration(item.text); Haptics.selectionAsync(); }}
                className={`p-3 rounded-xl border items-center w-[31%] ${
                  celebration === item.text ? 'border-primary bg-primary-light' : 'border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-700'
                }`}
              >
                <Text className="text-2xl mb-1">{item.emoji}</Text>
                <Text className="text-[11px] text-stone-600 dark:text-stone-300">{item.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Frequency */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-stone-700 dark:text-stone-100 mb-1">📅 打卡频率</Text>
          <Text className="text-sm text-stone-400 mb-3">选择每周需要打卡的日子</Text>
          <View className="flex-row justify-between mb-3">
            {weekDays.map((day, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => toggleDay(index)}
                className={`w-10 h-10 rounded-full items-center justify-center border ${
                  frequency.includes(index) ? 'bg-primary border-primary' : 'bg-white dark:bg-stone-700 border-stone-200 dark:border-stone-600'
                }`}
              >
                <Text className={`text-sm font-medium ${frequency.includes(index) ? 'text-white' : 'text-stone-600 dark:text-stone-300'}`}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reminder */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-stone-700 dark:text-stone-100 mb-1">🔔 提醒设置</Text>
          <Text className="text-sm text-stone-400 mb-3">开启提醒帮助你记住打卡</Text>
          <View className="bg-white dark:bg-stone-700 p-4 rounded-xl border border-stone-200 dark:border-stone-600">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-stone-700 dark:text-stone-100">开启提醒</Text>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{ false: '#e7e5e4', true: '#10B981' }}
                thumbColor="white"
              />
            </View>
            {reminderEnabled && (
              <View className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-600">
                <Text className="text-xs text-stone-400 mb-2">提醒时间</Text>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  className="bg-stone-50 dark:bg-stone-600 p-3 rounded-xl flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="time-outline" size={18} color="#10B981" />
                    <Text className="text-base font-semibold text-stone-700 dark:text-stone-100">
                      {formatTime(reminderTime)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#a8a29e" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View className="h-40" />
      </ScrollView>

      {/* Bottom Preview & Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-stone-800/95 border-t border-stone-100 dark:border-stone-700 px-5 pt-3 pb-8">
        <View className="bg-stone-50 dark:bg-stone-700 p-3 rounded-xl border border-stone-100 dark:border-stone-600 mb-3">
          <Text className="text-[10px] text-stone-400 font-semibold uppercase mb-1">我的配方</Text>
          <Text className="text-sm text-stone-700 dark:text-stone-100">
            当 <Text className={anchor ? 'text-primary font-semibold' : 'text-stone-300'}>{anchor || '___'}</Text> 后，
            我会 <Text className={behavior ? 'text-primary font-semibold' : 'text-stone-300'}>{behavior || '___'}</Text>，
            然后 <Text className={celebration ? 'text-primary font-semibold' : 'text-stone-300'}>{celebration || '___'}</Text>
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleCreate}
          disabled={!canCreate}
          className={`py-4 rounded-xl items-center ${canCreate ? 'bg-primary' : 'bg-stone-200 dark:bg-stone-600'}`}
        >
          <Text className={`font-semibold text-base ${canCreate ? 'text-white' : 'text-stone-400'}`}>
            确认创建
          </Text>
        </TouchableOpacity>
      </View>

      {/* Habit Library Modal */}
      <Modal visible={showLibrary} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl h-[85%]">
            {/* Modal Header */}
            <View className="p-4 border-b border-stone-100 flex-row items-center justify-between">
              <TouchableOpacity onPress={() => setShowLibrary(false)}>
                <Text className="text-stone-400 text-sm font-medium">取消</Text>
              </TouchableOpacity>
              <Text className="text-base font-bold text-stone-700">选择习惯</Text>
              <View className="w-10" />
            </View>

            {/* Category Tabs */}
            <View className="px-4 py-3 border-b border-stone-100">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                <View className="flex-row gap-2">
                  {habitCategories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => { setLibraryCategory(cat); Haptics.selectionAsync(); }}
                      className={`px-3 py-1.5 rounded-lg ${
                        libraryCategory === cat ? 'bg-primary' : 'bg-stone-100'
                      }`}
                    >
                      <Text className={`text-xs font-medium ${
                        libraryCategory === cat ? 'text-white' : 'text-stone-600'
                      }`}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Habit List */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {filteredHabits.map((habit, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => selectHabitFromLibrary(habit.name)}
                  className="px-4 py-3 flex-row items-center border-b border-stone-100"
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: habit.iconBg }}
                  >
                    <Text className="text-xl">{habit.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-stone-700">{habit.name}</Text>
                    <Text className="text-xs text-stone-400">{habit.desc}</Text>
                  </View>
                  <View className="w-5 h-5 rounded-full border-2 border-stone-200" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal visible={showTimePicker} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-stone-800 rounded-t-3xl">
            <View className="p-4 border-b border-stone-100 dark:border-stone-700 flex-row items-center justify-between">
              <TouchableOpacity onPress={() => setShowTimePicker(false)} className="w-12">
                <Text className="text-stone-400 dark:text-stone-300 text-sm font-medium">取消</Text>
              </TouchableOpacity>
              <View className="flex-row items-center gap-2">
                <Text className="text-lg">⏰</Text>
                <Text className="text-base font-bold text-stone-700 dark:text-stone-100">选择提醒时间</Text>
              </View>
              <TouchableOpacity onPress={() => setShowTimePicker(false)} className="w-12 items-end">
                <Text className="text-primary text-sm font-medium">确定</Text>
              </TouchableOpacity>
            </View>
            <View className="items-center">
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
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
