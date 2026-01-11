import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export function Button({ title, variant = 'primary', className, disabled, ...props }: ButtonProps) {
  const baseStyle = 'py-4 rounded-xl items-center justify-center';

  const variantStyles = {
    primary: disabled ? 'bg-stone-200' : 'bg-primary',
    secondary: 'bg-stone-100',
    outline: 'bg-transparent border border-stone-200',
  };

  const textStyles = {
    primary: disabled ? 'text-stone-400' : 'text-white',
    secondary: 'text-stone-700',
    outline: 'text-stone-700',
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
