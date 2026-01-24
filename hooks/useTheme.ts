import { useAuthStore, themeColors } from '../stores/authStore';

/**
 * 主题色 Hook
 * 用于获取当前主题的颜色值，在组件中通过 style 属性应用
 *
 * 使用示例：
 * const { primary, primaryLight } = useTheme();
 * <View style={{ backgroundColor: primary }}>...</View>
 */
export function useTheme() {
  const themeColor = useAuthStore((state) => state.themeColor);
  const isDarkMode = useAuthStore((state) => state.isDarkMode);

  const theme = themeColors[themeColor];

  return {
    // 主题色
    primary: theme.primary,
    primaryLight: theme.primaryLight,
    themeName: theme.name,
    themeKey: themeColor,

    // 深色模式
    isDarkMode,

    // 常用颜色（根据深色模式自动切换）
    text: isDarkMode ? '#FAFAF9' : '#0C0A09',
    textMuted: isDarkMode ? '#A8A29E' : '#78716c',
    background: isDarkMode ? '#0B0B0F' : '#F2F2F7',
    card: isDarkMode ? '#17171C' : '#FFFFFF',
    border: isDarkMode ? '#2A2A33' : '#E7E5E4',

    // 便捷方法：生成带透明度的主题色
    primaryWithOpacity: (opacity: number) => {
      const hex = theme.primary.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    },
  };
}

export default useTheme;
