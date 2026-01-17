import { View, Text } from 'react-native';

type BaseProps = {
  children: React.ReactNode;
  className?: string;
};

export function GroupCard({ children, className }: BaseProps) {
  return (
    <View
      className={`bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder rounded-[22px] ${className || ''}`}
    >
      {children}
    </View>
  );
}

export function GroupDivider({ className }: { className?: string }) {
  return <View className={`h-px bg-appBorder dark:bg-appDarkBorder ${className || ''}`} />;
}

export function GroupTitle({ children, className }: BaseProps) {
  return (
    <Text className={`text-base font-extrabold text-appText dark:text-appDarkText ${className || ''}`}>
      {children}
    </Text>
  );
}

