import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <View
      className={`bg-appCard dark:bg-appDarkCard p-4 rounded-[22px] border border-appBorder dark:border-appDarkBorder ${className || ''}`}
      {...props}
    >
      {children}
    </View>
  );
}
