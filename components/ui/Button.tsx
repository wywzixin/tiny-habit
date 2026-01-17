import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export function Button({ title, variant = 'primary', className, disabled, ...props }: ButtonProps) {
  const baseStyle = 'py-4 rounded-[22px] items-center justify-center';

  const variantStyles = {
    primary: disabled ? 'bg-appBorder dark:bg-appDarkBorder' : 'bg-appText dark:bg-appDarkText',
    secondary: 'bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder',
    outline: 'bg-transparent border border-appBorder dark:border-appDarkBorder',
  };

  const textStyles = {
    primary: disabled ? 'text-appMuted dark:text-appDarkMuted' : 'text-white dark:text-appText',
    secondary: 'text-appText dark:text-appDarkText',
    outline: 'text-appText dark:text-appDarkText',
  };

  return (
    <TouchableOpacity
      className={`${baseStyle} ${variantStyles[variant]} ${className || ''}`}
      disabled={disabled}
      activeOpacity={0.8}
      {...props}
    >
      <Text className={`font-semibold text-base ${textStyles[variant]}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
