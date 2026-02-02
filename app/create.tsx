import { View, Text, ScrollView, Pressable, TextInput, Switch, Platform, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useHabitStore, useAuthStore } from '../stores';
import { themeColors } from '../stores/authStore';
import { celebrations, weekDays } from '../constants';
import { BottomSheet } from '../components/ui/BottomSheet';
import { useCreateRecipe, useHabitLibrary, useDeleteHabit, useUpdateRecipe, useRecommendMicroBehaviors, useRecommendAnchors, useRecommendCombined } from '../services/api/hooks';
import { RecommendedMicroBehavior, RecommendedAnchor } from '../services/api/ai';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api/client';
import { getLocale, t } from '../utils/i18n';

// 习惯库分类
const habitCategories = ['全部', '新建', '推荐', '健康', '学习', '生活', '心理', '社交'];

const localSystemHabitsZh = [
  {
    id: 'system-1',
    name: '多喝水',
    icon: '💧',
    category: '推荐',
    source: 'system' as const,
    description: '每天8杯水，保持身体水分',
    popularity: 100,
  },
  {
    id: 'system-2',
    name: '早起',
    icon: '🌅',
    category: '推荐',
    source: 'system' as const,
    description: '早睡早起身体好',
    popularity: 95,
  },
  {
    id: 'system-3',
    name: '运动健身',
    icon: '💪',
    category: '健康',
    source: 'system' as const,
    description: '每天运动30分钟',
    popularity: 90,
  },
  {
    id: 'system-4',
    name: '阅读',
    icon: '📚',
    category: '学习',
    source: 'system' as const,
    description: '每天阅读15分钟',
    popularity: 85,
  },
  {
    id: 'system-5',
    name: '冥想',
    icon: '🧘',
    category: '心理',
    source: 'system' as const,
    description: '每天冥想10分钟',
    popularity: 80,
  },
  {
    id: 'system-6',
    name: '整理房间',
    icon: '🧹',
    category: '生活',
    source: 'system' as const,
    description: '保持环境整洁',
    popularity: 75,
  },
  {
    id: 'system-7',
    name: '联系朋友',
    icon: '👋',
    category: '社交',
    source: 'system' as const,
    description: '保持社交联系',
    popularity: 70,
  },
  {
    id: 'system-8',
    name: '健康饮食',
    icon: '🥗',
    category: '健康',
    source: 'system' as const,
    description: '多吃蔬菜水果',
    popularity: 88,
  },
  {
    id: 'system-9',
    name: '学习新技能',
    icon: '🎯',
    category: '学习',
    source: 'system' as const,
    description: '每天学习一点新知识',
    popularity: 82,
  },
  {
    id: 'system-10',
    name: '感恩日记',
    icon: '📝',
    category: '心理',
    source: 'system' as const,
    description: '记录每天的感恩事项',
    popularity: 78,
  },
];

const localSystemHabitsEn = [
  {
    id: 'system-1',
    name: 'Drink water',
    icon: '💧',
    category: '推荐',
    source: 'system' as const,
    description: '8 cups a day to stay hydrated',
    popularity: 100,
  },
  {
    id: 'system-2',
    name: 'Wake up early',
    icon: '🌅',
    category: '推荐',
    source: 'system' as const,
    description: 'Early to bed, early to rise',
    popularity: 95,
  },
  {
    id: 'system-3',
    name: 'Exercise',
    icon: '💪',
    category: '健康',
    source: 'system' as const,
    description: 'Move for 30 minutes a day',
    popularity: 90,
  },
  {
    id: 'system-4',
    name: 'Read',
    icon: '📚',
    category: '学习',
    source: 'system' as const,
    description: 'Read for 15 minutes daily',
    popularity: 85,
  },
  {
    id: 'system-5',
    name: 'Meditate',
    icon: '🧘',
    category: '心理',
    source: 'system' as const,
    description: '10 minutes of mindfulness',
    popularity: 80,
  },
  {
    id: 'system-6',
    name: 'Tidy up',
    icon: '🧹',
    category: '生活',
    source: 'system' as const,
    description: 'Keep your space clean',
    popularity: 75,
  },
  {
    id: 'system-7',
    name: 'Reach out',
    icon: '👋',
    category: '社交',
    source: 'system' as const,
    description: 'Stay socially connected',
    popularity: 70,
  },
  {
    id: 'system-8',
    name: 'Eat healthy',
    icon: '🥗',
    category: '健康',
    source: 'system' as const,
    description: 'More veggies and fruits',
    popularity: 88,
  },
  {
    id: 'system-9',
    name: 'Learn a skill',
    icon: '🎯',
    category: '学习',
    source: 'system' as const,
    description: 'Learn something new daily',
    popularity: 82,
  },
  {
    id: 'system-10',
    name: 'Gratitude journal',
    icon: '📝',
    category: '心理',
    source: 'system' as const,
    description: 'Write down what you’re grateful for',
    popularity: 78,
  },
];

const aiRecommendationsZh = {
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

const aiRecommendationsEn = {
  behaviors: [
    { text: 'Sip water', difficulty: 'easy', icon: '💧' },
    { text: 'Drink half a cup', difficulty: 'easy', icon: '🥤' },
    { text: 'Drink a full cup', difficulty: 'medium', icon: '🫗' },
  ],
  anchors: [
    { text: 'After waking up', icon: '🛏️' },
    { text: 'After arriving at work', icon: '💼' },
    { text: 'After a meal', icon: '🍚' },
  ],
};

export default function CreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
  const user = useAuthStore((s) => s.user);
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const language = useAuthStore((state) => state.language);
  const themeColor = useAuthStore((state) => state.themeColor);
  const currentTheme = themeColors[themeColor];
  const accent = currentTheme.primary;
  const accentSoft = currentTheme.primaryLight;
  const localSystemHabits = language === 'en' ? localSystemHabitsEn : localSystemHabitsZh;
  const aiRecommendations = language === 'en' ? aiRecommendationsEn : aiRecommendationsZh;
  
  // 创建配方的 mutation
  const createRecipeMutation = useCreateRecipe();
  
  // 更新配方的 mutation
  const updateRecipeMutation = useUpdateRecipe();
  
  // 获取云端习惯库数据（仅已登录用户）
  const { data: cloudHabits = [], isLoading: isLoadingLibrary, error: libraryError } = useHabitLibrary(
    undefined,
    { enabled: !!user?.id } // 仅在已登录时调用
  );
  
  // 编辑模式：获取云端微行为详情（仅已登录用户）
  const { data: cloudBehavior, isLoading: isLoadingBehavior } = useQuery({
    queryKey: ['microBehavior', editingId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/micro-behavior/${editingId}`);
      return response.data.data;
    },
    enabled: !!user?.id && !!editingId,
  });
  
  // 调试：打印错误信息
  useEffect(() => {
    if (libraryError) {
      console.error('习惯库加载失败:', libraryError);
    }
  }, [libraryError]);
  
  // 删除习惯的 mutation
  const deleteHabitMutation = useDeleteHabit();

  // 根据登录状态选择数据源
  const habitLibraryData = useMemo(() => {
    // 已登录：仅使用云端数据
    if (user?.id) {
      console.log('已登录用户，云端习惯数据:', cloudHabits);
      console.log('isLoadingLibrary:', isLoadingLibrary);
      return cloudHabits;
    }

    // 未登录：使用本地数据（用户习惯 + 系统习惯）
    const localHabitsFormatted = userHabitTemplates.map(h => ({
      id: h.id,
      name: h.name,
      icon: h.icon,
      category: '新建',
      source: 'user' as const,
      microBehaviorCount: 0,
      description: h.desc,
    }));

    console.log('未登录用户，本地习惯数据:', [...localHabitsFormatted, ...localSystemHabits]);
    return [...localHabitsFormatted, ...localSystemHabits];
  }, [user?.id, userHabitTemplates, cloudHabits, isLoadingLibrary]);

  const [goal, setGoal] = useState('');
  const [behavior, setBehavior] = useState('');
  const [anchor, setAnchor] = useState('');
  const [celebration, setCelebration] = useState('');
  const [frequency, setFrequency] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]); // 1-7 代表周一到周日

  // 习惯库弹窗状态
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryCategory, setLibraryCategory] = useState('全部');
  const [librarySearch, setLibrarySearch] = useState('');
  const [isEditMode, setIsEditMode] = useState(false); // 编辑模式状态

  // 提醒功能状态
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date(2026, 0, 1, 8, 0));
  const [showTimePicker, setShowTimePicker] = useState(false);

  // AI 推荐状态
  const [aiMicroBehaviors, setAiMicroBehaviors] = useState<RecommendedMicroBehavior[]>([]);
  const [aiAnchors, setAiAnchors] = useState<RecommendedAnchor[]>([]);
  const [selectedIcon, setSelectedIcon] = useState('✨');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  // AI 推荐 mutations
  const recommendMicroBehaviorsMutation = useRecommendMicroBehaviors();
  const recommendAnchorsMutation = useRecommendAnchors();
  const recommendCombinedMutation = useRecommendCombined();

  const formatTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:00`;
  };

  // 根据登录状态选择编辑数据源
  const editingBehavior = useMemo(() => {
    if (!editingId) return undefined;
    
    // 已登录：使用云端数据
    if (user?.id && cloudBehavior) {
      return {
        id: cloudBehavior.id.toString(),
        habitId: cloudBehavior.habitId?.toString() || '',
        name: cloudBehavior.name,
        icon: cloudBehavior.icon,
        anchor: cloudBehavior.anchor,
        behavior: cloudBehavior.behavior,
        celebration: cloudBehavior.celebration,
        difficulty: cloudBehavior.difficulty,
        frequency: JSON.parse(cloudBehavior.frequency || '[1,2,3,4,5,6,7]'),
        reminderEnabled: cloudBehavior.reminderEnabled,
        reminderTime: cloudBehavior.reminderTime,
        sortOrder: cloudBehavior.sortOrder || 0,
        isActive: cloudBehavior.isActive,
      };
    }
    
    // 未登录：使用本地数据
    return microBehaviors.find((b) => b.id === editingId);
  }, [editingId, user?.id, cloudBehavior, microBehaviors]);

  useEffect(() => {
    if (!editingId) return;
    if (!editingBehavior) return;

    setGoal(editingBehavior.name || '');
    setBehavior(editingBehavior.behavior || '');
    setAnchor(editingBehavior.anchor || '');
    setCelebration(editingBehavior.celebration || '');
    setFrequency(editingBehavior.frequency?.length ? editingBehavior.frequency : [1, 2, 3, 4, 5, 6, 7]);

    const t = editingBehavior.reminderTime;
    if (t && /^\d{2}:\d{2}/.test(t)) {
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
  const ensureAiAccess = () => {
    if (!user?.id) {
      Alert.alert(t(language, 'common.confirm'), t(language, 'auth.loginRequired'));
      return false;
    }
    return true;
  };

  const getExcludeBehaviors = () => {
    const names = aiMicroBehaviors
      .map((item) => item.name || item.behavior)
      .filter((value): value is string => Boolean(value));
    return Array.from(new Set(names));
  };

  const getExcludeAnchors = () => {
    const names = aiAnchors
      .map((item) => item.anchor)
      .filter((value): value is string => Boolean(value));
    return Array.from(new Set(names));
  };

  const isAiBehaviorsLoading = recommendMicroBehaviorsMutation.isPending || recommendCombinedMutation.isPending;
  const isAiAnchorsLoading = recommendAnchorsMutation.isPending || recommendCombinedMutation.isPending;

  // 处理习惯库数据
  const processedHabits = useMemo(() => {
    console.log('=== 习惯库数据处理 ===');
    console.log('habitLibraryData 原始数据:', habitLibraryData);
    console.log('当前分类:', libraryCategory);
    console.log('搜索关键词:', librarySearch);
    
    // 根据分类筛选
    let filtered = habitLibraryData;
    if (libraryCategory !== '全部') {
      filtered = habitLibraryData.filter((h) => h.category === libraryCategory);
      console.log('分类筛选后:', filtered);
    }

    // 根据搜索关键词筛选
    const q = librarySearch.trim();
    if (q) {
      filtered = filtered.filter((h) => 
        h.name.includes(q) || h.description?.includes(q)
      );
      console.log('搜索筛选后:', filtered);
    }

    console.log('最终结果:', filtered);
    return filtered;
  }, [habitLibraryData, libraryCategory, librarySearch]);

  // 获取图标背景色（根据分类）
  const getIconBg = (category: string) => {
    const colorMap: Record<string, string> = {
      '推荐': '#D1FAE5',
      '健康': '#CFFAFE',
      '学习': '#FEF3C7',
      '生活': '#DBEAFE',
      '心理': '#FCE7F3',
      '社交': '#DBEAFE',
      '新建': '#E7E5E4',
    };
    return colorMap[category] || '#E7E5E4';
  };

  const selectHabitFromLibrary = (name: string) => {
    setGoal(name);
    setLibrarySearch('');
    setShowLibrary(false);
    Haptics.selectionAsync();
  };

  const toggleDay = (day: number) => {
    Haptics.selectionAsync();
    // day 是 UI 索引 0-6，对应后端 1-7（周一到周日）
    const backendDay = day + 1;
    setFrequency((prev) =>
      prev.includes(backendDay) ? prev.filter((d) => d !== backendDay) : [...prev, backendDay].sort()
    );
  };

  // AI 推荐微行为
  const handleAiRecommendBehaviors = async () => {
    if (!goal.trim()) return;
    if (!ensureAiAccess()) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const result = await recommendMicroBehaviorsMutation.mutateAsync({
        habitName: goal.trim(),
        habitCategory: undefined,
        userContext: undefined,
        refresh: true,
        excludeBehaviors: getExcludeBehaviors(),
      });
      console.log('=== AI 推荐微行为返回内容 ===');
      console.log(JSON.stringify(result, null, 2));
      setAiMicroBehaviors(result);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error('AI 推荐微行为失败:', error);
    }
  };

  // AI 推荐锚点
  const handleAiRecommendAnchors = async () => {
    if (!goal.trim()) return;
    if (!ensureAiAccess()) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const result = await recommendAnchorsMutation.mutateAsync({
        habitName: goal.trim(),
        timeOfDay: undefined,
        userContext: behavior ? `用户选择的微行为是"${behavior}"` : undefined,
        refresh: true,
        excludeAnchors: getExcludeAnchors(),
      });
      console.log('=== AI 推荐锚点返回内容 ===');
      console.log(JSON.stringify(result, null, 2));
      setAiAnchors(result);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error('AI 推荐锚点失败:', error);
    }
  };

  // 输入框失去焦点时触发 AI 推荐（同时请求微行为和锚点）
  const handleGoalBlur = async () => {
    const trimmedGoal = goal.trim();
    if (!trimmedGoal || trimmedGoal.length < 2) return;
    if (!user?.id) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const result = await recommendCombinedMutation.mutateAsync({
        habitName: trimmedGoal,
        habitCategory: undefined,
        timeOfDay: undefined,
        userContext: undefined,
        maxItems: 6,
        refresh: false,
      });
      console.log('=== AI 合并推荐返回内容 ===');
      console.log(JSON.stringify(result, null, 2));
      setAiMicroBehaviors(result.micro_behaviors || []);
      setAiAnchors(result.anchors || []);
    } catch (error: any) {
      console.error('AI 合并推荐失败:', error);
    }
  };

  // 选择 AI 推荐的微行为
  const selectAiMicroBehavior = (item: RecommendedMicroBehavior) => {
    setBehavior(item.name || item.behavior);
    setSelectedIcon(item.icon || '✨');
    setSelectedDifficulty(item.difficulty || 'easy');
    Haptics.selectionAsync();

    if (aiAnchors.length === 0 && item.anchor_suggestions && item.anchor_suggestions.length > 0) {
      const suggestions = item.anchor_suggestions.map((anchorText) => ({
        anchor: anchorText,
        description: '',
        timeOfDay: '',
        icon: '✨',
      }));
      setAiAnchors(suggestions);
    }
  };

  // 选择 AI 推荐的锚点
  const selectAiAnchor = (item: RecommendedAnchor) => {
    setAnchor(item.anchor);
    Haptics.selectionAsync();
  };

  // 获取难度样式（使用后端返回的 estimatedTime）
  const getDifficultyStyle = (difficulty: string) => {
    const colorMap = {
      easy: 'bg-green-500',
      medium: 'bg-orange-500',
      hard: 'bg-red-500',
    };

    const textMap = {
      easy: t(language, 'create.levelEasy'),
      medium: t(language, 'create.levelMedium'),
      hard: t(language, 'create.levelHard'),
    };

    return {
      bg: colorMap[difficulty as keyof typeof colorMap] || 'bg-green-500',
      text: textMap[difficulty as keyof typeof textMap] || textMap.easy,
    };
  };

const handleDeleteUserHabit = async (id: number | string, name: string) => {
  Alert.alert(t(language, 'create.deleteHabit'), `${t(language, 'create.deleteHabitConfirm')} "${name}"？\n\n${t(language, 'create.deleteHabitHint')}`, [
    { text: t(language, 'common.cancel'), style: 'cancel' },
    {
      text: t(language, 'detail.delete'),
      style: 'destructive',
      onPress: async () => {
        try {
          // 已登录用户：调用后端 API
          if (user?.id && typeof id === 'number') {
            await deleteHabitMutation.mutateAsync(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } 
          // 未登录用户：删除本地习惯
          else if (typeof id === 'string') {
            deleteUserHabitTemplate(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        } catch (error: any) {
          console.error('删除习惯失败:', error);
          
          let errorMessage = t(language, 'detail.deleteFailed');
          if (error.code === 403) {
            errorMessage = t(language, 'create.deleteSystemHabitBlocked');
          } else if (error.code === 404) {
            errorMessage = t(language, 'create.habitNotFound');
          }
          Alert.alert(t(language, 'detail.deleteFailed'), errorMessage);
        }
      },
    },
  ]);
};


  const handleCreate = async () => {
    if (!canCreate) return;

    // 未登录用户：使用本地存储
    if (!user?.id) {
      // 保存习惯到本地（如果是新习惯）
      const goalName = goal.trim();
      if (goalName && !userHabitTemplates.some(h => h.name === goalName)) {
        addUserHabitTemplate(goalName);
      }

      // 保存微行为到本地
      addMicroBehavior({
        habitId: 'local-habit-1',
        name: behavior,
        icon: selectedIcon,
        anchor,
        behavior,
        celebration,
        difficulty: selectedDifficulty,
        frequency,
        reminderEnabled,
        reminderTime: reminderEnabled ? formatTime(reminderTime) : undefined,
        sortOrder: 0,
        isActive: true,
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
      return;
    }

    // 已登录用户：调用后端 API
    try {
      await createRecipeMutation.mutateAsync({
        habitName: goal.trim() || behavior.trim(),
        habitIcon: selectedIcon,
        habitCategory: '自定义',
        microBehavior: {
          name: behavior,
          icon: selectedIcon,
          anchor,
          behavior,
          celebration,
          difficulty: selectedDifficulty,
          frequency,
          reminderEnabled,
          reminderTime: reminderEnabled ? formatTime(reminderTime) : undefined,
        },
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error: any) {
      console.error('创建配方失败 - 详细信息:', error);
      
      // 转换为用户友好的错误信息
      let friendlyMessage = t(language, 'create.createFailed');
      if (error.code === 0) {
        friendlyMessage = t(language, 'create.networkError');
      } else if (error.message?.includes('数据库') || error.message?.includes('SQL')) {
        friendlyMessage = t(language, 'create.serverError');
      }
      
      Alert.alert(t(language, 'create.createFailed'), friendlyMessage);
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    if (!editingBehavior) return;
    if (!canCreate) return;

    // 未登录用户：使用本地存储
    if (!user?.id) {
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
      return;
    }

    // 已登录用户：调用后端 API
    try {
      await updateRecipeMutation.mutateAsync({
        microBehaviorId: Number(editingId),
        habitName: goal.trim() || behavior.trim(),
        habitIcon: '✨',
        habitCategory: '自定义',
        microBehavior: {
          name: behavior,
          icon: '✨',
          anchor,
          behavior,
          celebration,
          difficulty: 'easy',
          frequency,
          reminderEnabled,
          reminderTime: reminderEnabled ? formatTime(reminderTime) : undefined,
        },
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error: any) {
      console.error('更新配方失败:', error);
      Alert.alert(t(language, 'create.updateFailed'), error.message || t(language, 'common.tryLater'));
    }
  };

  const handleSubmit = editingId ? handleUpdate : handleCreate;

  return (
    <SafeAreaView className="flex-1 bg-appBg dark:bg-appDarkBg">
      {/* Header */}
      <View className="px-5 pt-2 pb-3">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="px-3 py-2 rounded-full border border-appBorder dark:border-appDarkBorder"
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          >
            <Text className="text-appMuted dark:text-appDarkMuted text-[12px] font-bold">{t(language, 'common.cancel')}</Text>
          </Pressable>

          <View className="items-center">
            <Text className="text-[16px] font-extrabold text-appText dark:text-appDarkText">
              {editingId ? t(language, 'create.editTitle') : t(language, 'create.newTitle')}
            </Text>
          </View>

          {editingId ? (
            <Pressable
              onPress={handleUpdate}
              className={`px-3 py-2 rounded-2xl ${
                canCreate ? 'bg-appText dark:bg-appDarkText' : 'bg-appBorder dark:bg-appDarkBorder'
              }`}
              disabled={!canCreate}
              style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
            >
              <Text className={`text-[12px] font-extrabold ${
                canCreate ? 'text-white dark:text-appText' : 'text-appMuted dark:text-appDarkMuted'
              }`}>
                {t(language, 'common.save')}
              </Text>
            </Pressable>
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
            {t(language, 'create.goalTitle')}
          </Text>
          <Text className="text-sm font-semibold text-appMuted dark:text-appDarkMuted mb-3">
            {t(language, 'create.goalHint')}
          </Text>
          <View className="bg-appCard dark:bg-appDarkCard px-4 py-3 rounded-[18px] border border-appBorder dark:border-appDarkBorder">
            <View className="flex-row items-center">
              <Ionicons name="search" size={18} color={isDarkMode ? '#a8a29e' : '#78716c'} />
            <TextInput
              value={goal}
              onChangeText={setGoal}
              onBlur={handleGoalBlur}
              placeholder={t(language, 'create.goalPlaceholder')}
              className="flex-1 ml-2 text-[14px] font-semibold text-appText dark:text-appDarkText"
              placeholderTextColor={isDarkMode ? '#a8a29e' : '#a8a29e'}
              style={Platform.OS === 'android' ? { padding: 0, height: 24 } : undefined}
            />
            <Pressable
              onPress={() => setShowLibrary(true)}
              className="px-3 py-2 rounded-full flex-row items-center border"
              style={({ pressed }) => [
                {
                  borderColor: accent + '40',
                  backgroundColor: isDarkMode ? accent + '22' : accentSoft,
                },
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Ionicons name="book-outline" size={14} color={accent} />
              <Text className="text-xs font-bold ml-1" style={{ color: accent }}>
                {t(language, 'create.library')}
              </Text>
            </Pressable>
            </View>
          </View>
        </View>

        {/* Behavior Selection */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-lg font-extrabold text-appText dark:text-appDarkText">{t(language, 'create.behaviorTitle')}</Text>
              <Pressable
                onPress={handleAiRecommendBehaviors}
                disabled={isAiBehaviorsLoading}
                style={({ pressed }) => [
                  {
                    opacity: (isAiBehaviorsLoading ? 0.6 : 1) * (pressed ? 0.85 : 1),
                  },
                ]}
              >
              <View
                className="flex-row items-center px-3 py-1.5 rounded-full border"
                style={{
                  borderColor: accent + '35',
                  backgroundColor: isDarkMode ? accent + '1F' : accentSoft,
                }}
              >
                <Ionicons name="sparkles" size={12} color={accent} />
                <Text className="text-[11px] font-bold ml-1" style={{ color: accent }}>
                  {t(language, 'create.aiRecommend')}
                </Text>
              </View>
            </Pressable>
          </View>
          <Text className="text-sm font-semibold text-appMuted dark:text-appDarkMuted mb-3">{t(language, 'create.behaviorHint')}</Text>

          {/* AI 推荐的微行为列表 */}
          {isAiBehaviorsLoading ? (
            <View className="p-4 rounded-[18px] bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder items-center mb-3">
              <View className="flex-row items-center gap-2">
                <Ionicons name="sparkles" size={14} color={accent} />
                <Text className="text-[13px] font-bold text-appMuted dark:text-appDarkMuted">
                  {t(language, 'create.aiThinking')}
                </Text>
              </View>
              <Text className="text-[11px] font-medium text-appMuted dark:text-appDarkMuted mt-1.5">
                {t(language, 'create.aiGenerating')}
              </Text>
            </View>
          ) : aiMicroBehaviors.length > 0 ? (
            <ScrollView
              className="mb-3"
              style={{ maxHeight: 320 }}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              <View className="gap-2">
              {aiMicroBehaviors.map((item, index) => {
                const difficultyStyle = getDifficultyStyle(item.difficulty);
                const isSelected = behavior === item.behavior;
                return (
                  <Pressable
                    key={index}
                    onPress={() => selectAiMicroBehavior(item)}
                    className={`p-3 rounded-[18px] border ${
                      isSelected
                        ? 'bg-primary/10 dark:bg-primary/15 border-primary/25 dark:border-primary/30'
                        : 'bg-appCard dark:bg-appDarkCard border-appBorder dark:border-appDarkBorder'
                    }`}
                    style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1 }]}
                  >
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-[14px] bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder items-center justify-center mr-3">
                        <Text className="text-[20px]">{item.icon || '✨'}</Text>
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 flex-wrap">
                          <Text className="text-[14px] font-extrabold text-appText dark:text-appDarkText">{item.name}</Text>
                          <View className={`px-2 py-0.5 rounded-full ${difficultyStyle.bg}`}>
                            <Text className="text-[10px] font-bold text-white">
                              {difficultyStyle.text}{item.estimatedTime ? ` · ${item.estimatedTime}内完成` : ''}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-[11px] font-medium text-appMuted dark:text-appDarkMuted mt-1" numberOfLines={2}>
                          {item.description}
                        </Text>
                      </View>
                      {isSelected && (
                        <View className="w-7 h-7 rounded-full bg-primary items-center justify-center ml-2">
                          <Ionicons name="checkmark" size={14} color="white" />
                        </View>
                      )}
                    </View>
                  </Pressable>
                );
              })}
              </View>
            </ScrollView>
          ) : (
            <View className="p-4 rounded-[18px] bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder items-center mb-3">
              <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted text-center">
                {t(language, 'create.inputHabitForAi')}
              </Text>
            </View>
          )}
          <TextInput
            value={behavior}
            onChangeText={setBehavior}
            placeholder={t(language, 'create.behaviorPlaceholder')}
            className="bg-appCard dark:bg-appDarkCard px-4 py-3 rounded-[18px] border border-appBorder dark:border-appDarkBorder text-[14px] font-semibold text-appText dark:text-appDarkText"
            placeholderTextColor={isDarkMode ? '#a8a29e' : '#a8a29e'}
          />
        </View>

        {/* Anchor Selection */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-lg font-extrabold text-appText dark:text-appDarkText">{t(language, 'create.anchorTitle')}</Text>
              <Pressable
                onPress={handleAiRecommendAnchors}
                disabled={isAiAnchorsLoading}
                style={({ pressed }) => [
                  {
                    opacity: (isAiAnchorsLoading ? 0.6 : 1) * (pressed ? 0.85 : 1),
                  },
                ]}
              >
              <View
                className="flex-row items-center px-3 py-1.5 rounded-full border"
                style={{
                  borderColor: accent + '35',
                  backgroundColor: isDarkMode ? accent + '1F' : accentSoft,
                }}
              >
                <Ionicons name="sparkles" size={12} color={accent} />
                <Text className="text-[11px] font-bold ml-1" style={{ color: accent }}>
                  {t(language, 'create.aiRecommend')}
                </Text>
              </View>
            </Pressable>
          </View>
          <Text className="text-sm font-semibold text-appMuted dark:text-appDarkMuted mb-3">{t(language, 'create.anchorHint')}</Text>

          {/* AI 推荐的锚点列表 */}
          {isAiAnchorsLoading ? (
            <View className="p-4 rounded-[18px] bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder items-center mb-3">
              <View className="flex-row items-center gap-2">
                <Ionicons name="sparkles" size={14} color={accent} />
                <Text className="text-[13px] font-bold text-appMuted dark:text-appDarkMuted">
                  {t(language, 'create.aiThinking')}
                </Text>
              </View>
              <Text className="text-[11px] font-medium text-appMuted dark:text-appDarkMuted mt-1.5">
                {t(language, 'create.aiGenerating')}
              </Text>
            </View>
          ) : aiAnchors.length > 0 ? (
            <ScrollView
              className="mb-3"
              style={{ maxHeight: 280 }}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              <View className="gap-2">
              {aiAnchors.map((item, index) => {
                const isSelected = anchor === item.anchor;
                return (
                  <Pressable
                    key={index}
                    onPress={() => selectAiAnchor(item)}
                    className={`p-3 rounded-[18px] border ${
                      isSelected
                        ? 'bg-primary/10 dark:bg-primary/15 border-primary/25 dark:border-primary/30'
                        : 'bg-appCard dark:bg-appDarkCard border-appBorder dark:border-appDarkBorder'
                    }`}
                    style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1 }]}
                  >
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-[14px] bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder items-center justify-center mr-3">
                        <Text className="text-[20px]">{item.icon || '✨'}</Text>
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-[14px] font-extrabold text-appText dark:text-appDarkText">{item.anchor}</Text>
                          <View className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                            <Text className="text-[10px] font-bold text-primary">{item.timeOfDay || t(language, 'common.optional')}</Text>
                          </View>
                        </View>
                        <Text className="text-[11px] font-medium text-appMuted dark:text-appDarkMuted mt-1" numberOfLines={2}>
                          {item.description || t(language, 'common.optional')}
                        </Text>
                      </View>
                      {isSelected && (
                        <View className="w-7 h-7 rounded-full bg-primary items-center justify-center ml-2">
                          <Ionicons name="checkmark" size={14} color="white" />
                        </View>
                      )}
                    </View>
                  </Pressable>
                );
              })}
              </View>
            </ScrollView>
          ) : (
            <View className="p-4 rounded-[18px] bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder items-center mb-3">
              <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted text-center">
                {goal ? t(language, 'create.aiGenerating') : t(language, 'create.inputHabitForAi')}
              </Text>
            </View>
          )}
          <TextInput
            value={anchor}
            onChangeText={setAnchor}
            placeholder={t(language, 'create.anchorPlaceholder')}
            className="bg-appCard dark:bg-appDarkCard px-4 py-3 rounded-[18px] border border-appBorder dark:border-appDarkBorder text-[14px] font-semibold text-appText dark:text-appDarkText"
            placeholderTextColor={isDarkMode ? '#a8a29e' : '#a8a29e'}
          />
        </View>

        {/* Celebration */}
        <View className="mb-8">
          <Text className="text-lg font-extrabold text-appText dark:text-appDarkText mb-1">{t(language, 'create.celebrationTitle')}</Text>
          <Text className="text-sm font-semibold text-appMuted dark:text-appDarkMuted mb-3">{t(language, 'create.celebrationHint')}</Text>
          <View className="flex-row flex-wrap gap-2">
            {celebrations.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => { setCelebration(item.text); Haptics.selectionAsync(); }}
                className={`p-3 rounded-[18px] border items-center w-[31%] ${
                  celebration === item.text
                    ? 'bg-primary/10 dark:bg-primary/15 border-primary/25 dark:border-primary/30'
                    : 'bg-appCard dark:bg-appDarkCard border-appBorder dark:border-appDarkBorder'
                }`}
                style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1 }]}
              >
                <Text className="text-2xl mb-1">{item.emoji}</Text>
                <Text className="text-[11px] font-bold text-appMuted dark:text-appDarkMuted">{item.text}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Frequency */}
        <View className="mb-8">
          <Text className="text-lg font-extrabold text-appText dark:text-appDarkText mb-1">{t(language, 'create.frequencyTitle')}</Text>
          <Text className="text-sm font-semibold text-appMuted dark:text-appDarkMuted mb-3">{t(language, 'create.frequencyHint')}</Text>
          <View className="bg-appCard dark:bg-appDarkCard p-3 rounded-[18px] border border-appBorder dark:border-appDarkBorder">
            <View className="flex-row justify-between">
              {weekDays.map((day, index) => {
              const backendDay = index + 1; // UI 索引 0-6 对应后端 1-7
              return (
                <Pressable
                  key={index}
                  onPress={() => toggleDay(index)}
                  className={`w-9 h-9 rounded-full items-center justify-center border ${
                    frequency.includes(backendDay)
                      ? 'bg-primary/15 border-primary/30'
                      : 'bg-appBg dark:bg-appDarkBg border-appBorder dark:border-appDarkBorder'
                  }`}
                  style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                >
                  <Text className={`text-sm font-extrabold ${
                    frequency.includes(backendDay) ? 'text-primary' : 'text-appMuted dark:text-appDarkMuted'
                  }`}>
                    {day}
                  </Text>
                </Pressable>
              );
            })}
            </View>
          </View>
        </View>

        {/* Reminder */}
        <View className="mb-8">
          <Text className="text-lg font-extrabold text-appText dark:text-appDarkText mb-1">{t(language, 'create.reminderTitle')}</Text>
          <Text className="text-sm font-semibold text-appMuted dark:text-appDarkMuted mb-3">{t(language, 'create.reminderHint')}</Text>
          <View className="bg-appCard dark:bg-appDarkCard p-4 rounded-[18px] border border-appBorder dark:border-appDarkBorder">
            <View className="bg-appBg dark:bg-appDarkBg px-3 py-2 rounded-[14px] border border-appBorder dark:border-appDarkBorder">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-[14px] font-extrabold text-appText dark:text-appDarkText">{t(language, 'create.reminderSwitch')}</Text>
                  <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted mt-1">
                    {t(language, 'create.reminderNote')}
                  </Text>
                </View>
                <Switch
                  value={reminderEnabled}
                  onValueChange={setReminderEnabled}
                  trackColor={{ false: '#e7e5e4', true: accent }}
                  thumbColor="white"
                />
              </View>
            </View>
            {reminderEnabled && (
              <View className="mt-3">
                <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted mb-2">{t(language, 'create.reminderTime')}</Text>
                <Pressable
                  onPress={() => setShowTimePicker(true)}
                  className="bg-appBg dark:bg-appDarkBg px-4 py-2.5 rounded-[18px] flex-row items-center justify-between border border-appBorder dark:border-appDarkBorder"
                  style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                >
                  <View className="flex-row items-center gap-2">
                    <View className="w-8 h-8 rounded-full items-center justify-center bg-primary/10 border border-primary/15">
                      <Ionicons name="time-outline" size={16} color={accent} />
                    </View>
                    <Text className="text-[15px] font-extrabold text-appText dark:text-appDarkText">
                      {formatTime(reminderTime)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#a8a29e" />
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Preview & Button */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-appBg dark:bg-appDarkBg border-t border-appBorder dark:border-appDarkBorder px-5 pt-3"
        style={{ paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 16) : 32 }}
      >
        <View className="bg-appCard dark:bg-appDarkCard p-4 rounded-[18px] border border-appBorder dark:border-appDarkBorder mb-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[11px] font-extrabold text-appMuted dark:text-appDarkMuted">{t(language, 'create.previewTitle')}</Text>
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="sparkles" size={14} color="#10B981" />
              <Text className="text-[11px] font-extrabold text-primary">B = MAP</Text>
            </View>
          </View>
          <Text className="text-[14px] font-semibold text-appText dark:text-appDarkText leading-relaxed">
            {t(language, 'create.previewWhen')}{' '}
            <Text className={anchor ? 'text-primary font-extrabold' : 'text-appMuted dark:text-appDarkMuted'}>{anchor || '___'}</Text>{' '}
            {t(language, 'create.previewAfter')}{' '}
            {t(language, 'create.previewIWill')}{' '}
            <Text className={behavior ? 'text-primary font-extrabold' : 'text-appMuted dark:text-appDarkMuted'}>{behavior || '___'}</Text>
            {t(language, 'create.previewSeparator')}{' '}
            {t(language, 'create.previewThen')}{' '}
            <Text className={celebration ? 'text-primary font-extrabold' : 'text-appMuted dark:text-appDarkMuted'}>{celebration || '___'}</Text>
          </Text>
        </View>
        <Pressable
          onPress={handleSubmit}
          disabled={!canCreate}
          className={`py-4 rounded-[18px] items-center ${
            canCreate ? 'bg-appText dark:bg-appDarkText' : 'bg-appBorder dark:bg-appDarkBorder'
          }`}
          style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
        >
          <Text className={`font-extrabold text-base ${canCreate ? 'text-white dark:text-appText' : 'text-appMuted dark:text-appDarkMuted'}`}>
            {editingId ? t(language, 'create.saveChanges') : t(language, 'create.confirmCreate')}
          </Text>
        </Pressable>
      </View>

      <BottomSheet
        visible={showLibrary}
        title={t(language, 'create.chooseHabitTitle')}
        onClose={() => { 
          setShowLibrary(false); 
          setLibrarySearch(''); 
          setIsEditMode(false); // 关闭时退出编辑模式
        }}
        height="85%"
      >
        {isLoadingLibrary && user?.id ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-appMuted dark:text-appDarkMuted">{t(language, 'common.loading')}</Text>
          </View>
        ) : (
        <>
        <View className="px-4 pb-4">
          {/* 顶部搜索栏和编辑按钮 */}
          <View className="flex-row items-center gap-2 mt-2">
            <View className="flex-1 rounded-[18px] bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder px-4 py-3 flex-row items-center">
              <Ionicons name="search" size={18} color={isDarkMode ? '#a8a29e' : '#78716c'} />
              <TextInput
                value={librarySearch}
                onChangeText={setLibrarySearch}
                placeholder={t(language, 'create.searchHabitPlaceholder')}
                className="flex-1 ml-2 text-[14px] font-semibold text-appText dark:text-appDarkText"
                placeholderTextColor={isDarkMode ? '#a8a29e' : '#a8a29e'}
                returnKeyType="search"
              />
              {librarySearch.trim().length > 0 && (
                <Pressable
                  onPress={() => setLibrarySearch('')}
                  className="w-8 h-8 rounded-full bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder items-center justify-center"
                  style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                >
                  <Ionicons name="close" size={16} color={isDarkMode ? '#d6d3d1' : '#78716c'} />
                </Pressable>
              )}
            </View>
            
            {/* 编辑按钮 - 仅当有用户创建的习惯时显示 */}
            {processedHabits.some(h => h.source === 'user') && (
              <Pressable
                onPress={() => {
                  setIsEditMode(!isEditMode);
                  Haptics.selectionAsync();
                }}
                className={`px-4 py-3 rounded-[18px] border ${
                  isEditMode
                    ? 'bg-primary/10 border-primary/30'
                    : 'bg-appCard dark:bg-appDarkCard border-appBorder dark:border-appDarkBorder'
                }`}
                style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
              >
                <Text className={`text-[14px] font-bold ${
                  isEditMode ? 'text-primary' : 'text-appText dark:text-appDarkText'
                }`}>
                  {isEditMode ? t(language, 'common.done') : t(language, 'common.edit')}
                </Text>
              </Pressable>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
            <View className="flex-row gap-2 pr-3">
              {habitCategories.map((cat) => {
                const active = libraryCategory === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => { setLibraryCategory(cat); Haptics.selectionAsync(); }}
                    className={`px-4 py-2 rounded-full border ${
                      active
                        ? 'bg-primary/10 border-primary/25'
                        : 'bg-appCard dark:bg-appDarkCard border-appBorder dark:border-appDarkBorder'
                    }`}
                    style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        active ? 'text-primary' : 'text-appMuted dark:text-appDarkMuted'
                      }`}
                    >
                      {t(language, `create.category.${cat}`)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View className="flex-row items-center justify-between mt-4">
            <Text className="text-[12px] font-extrabold text-appText dark:text-appDarkText">
              {libraryCategory === '新建'
                ? t(language, 'create.libraryMine')
                : libraryCategory === '全部'
                  ? t(language, 'create.libraryAll')
                  : t(language, 'create.libraryRecommended')}
            </Text>
            <View className="px-3 py-1.5 rounded-full bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder">
              <Text className="text-[11px] font-bold text-appMuted dark:text-appDarkMuted">
                {processedHabits.length} {t(language, 'common.items')}
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
            {processedHabits.length === 0 ? (
              <View className="bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder rounded-[18px] p-8 items-center">
                <Text className="text-4xl mb-3">🔎</Text>
                <Text className="text-sm font-extrabold text-appText dark:text-appDarkText">
                  {t(language, 'create.noHabitFound')}
                </Text>
                <Text className="text-xs font-semibold text-appMuted dark:text-appDarkMuted mt-2 text-center leading-relaxed">
                  {t(language, 'create.noHabitHint')}
                </Text>
                <Pressable
                  onPress={() => setLibrarySearch('')}
                  className="mt-5 px-4 py-3 rounded-2xl bg-appText dark:bg-appDarkText"
                  style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                >
                  <Text className="text-white dark:text-appText font-extrabold">
                    {t(language, 'common.clear')}
                  </Text>
                </Pressable>
              </View>
            ) : (
              processedHabits.map((habit) => {
                const selected = goal === habit.name;
                const isUserHabit = habit.source === 'user';
                // 使用 source + id 作为唯一 key，避免本地和云端 ID 冲突
                const uniqueKey = `${habit.source}-${habit.id}`;
                return (
                  <Pressable
                    key={uniqueKey}
                    onPress={() => {
                      // 编辑模式下不允许选择
                      if (!isEditMode) {
                        selectHabitFromLibrary(habit.name);
                      }
                    }}
                    className={`p-4 rounded-[18px] border flex-row items-center ${
                      selected && !isEditMode
                        ? 'bg-primary/10 dark:bg-primary/15 border-primary/25 dark:border-primary/30'
                        : 'bg-appCard dark:bg-appDarkCard border-appBorder dark:border-appDarkBorder'
                    } ${isEditMode && !isUserHabit ? 'opacity-50' : ''}`}
                    style={({ pressed }) => (pressed && !isEditMode ? { opacity: 0.92 } : undefined)}
                  >
                    <View
                      className="w-11 h-11 rounded-[14px] items-center justify-center mr-3 border border-appBorder dark:border-appDarkBorder"
                      style={{ backgroundColor: getIconBg(habit.category) }}
                    >
                      <Text className="text-[22px]">{habit.icon}</Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-[14px] font-extrabold text-appText dark:text-appDarkText">
                          {habit.name}
                        </Text>
                        <View className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/15">
                          <Text className="text-[11px] font-bold text-primary">
                            {t(language, `create.category.${habit.category}`)}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted mt-2">
                        {habit.description || t(language, 'common.noDescription')}
                      </Text>
                    </View>
                    
                    {/* 右侧按钮区域 */}
                    <View className="flex-row items-center gap-2">
                      {/* 编辑模式：显示删除按钮（仅用户习惯） */}
                      {isEditMode && isUserHabit ? (
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            handleDeleteUserHabit(habit.id, habit.name);
                          }}
                          className="w-10 h-10 rounded-full items-center justify-center border border-red-100 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10"
                          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                        >
                          <Ionicons name="trash-outline" size={18} color="#ef4444" />
                        </Pressable>
                      ) : (
                        /* 正常模式：显示添加/选中按钮 */
                        !isEditMode && (
                          <View className={`w-9 h-9 rounded-full items-center justify-center border ${
                            selected
                              ? 'bg-primary border-primary'
                              : 'bg-primary/10 border-primary/20'
                          }`}>
                            <Ionicons
                              name={selected ? 'checkmark' : 'add'}
                              size={20}
                              color={selected ? 'white' : accent}
                            />
                          </View>
                        )
                      )}
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        </ScrollView>
        </>
        )}
      </BottomSheet>

      {/* Android: 直接渲染 DateTimePicker（系统原生弹窗） */}
      {Platform.OS === 'android' && showTimePicker && (
        <DateTimePicker
          value={reminderTime}
          mode="time"
          display="spinner"
          onChange={onTimeChange}
          locale={getLocale(language)}
        />
      )}

      {/* iOS: 使用 BottomSheet 包裹 */}
      {Platform.OS === 'ios' && (
        <BottomSheet
          visible={showTimePicker}
          title={t(language, 'create.reminderTime')}
          onClose={() => setShowTimePicker(false)}
          leftLabel={t(language, 'common.cancel')}
          rightLabel={t(language, 'common.confirm')}
          height={300}
        >
          <View className="items-center py-2">
            <DateTimePicker
              value={reminderTime}
              mode="time"
              display="spinner"
              onChange={onTimeChange}
              locale={getLocale(language)}
              style={{ height: 200, width: '100%' }}
              themeVariant={isDarkMode ? 'dark' : 'light'}
            />
          </View>
        </BottomSheet>
      )}
    </SafeAreaView>
  );
}
