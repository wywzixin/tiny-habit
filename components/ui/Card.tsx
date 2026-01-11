import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <View
      className={`bg-white p-4 rounded-[20px] border border-stone-200 ${className || ''}`}
      {...props}
    >
      {children}
    </View>
  );
}
