export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-300'
  
  const variants = {
    primary: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/50 active:scale-95',
    secondary: 'bg-white/10 text-white border border-white/20 hover:bg-white/20 active:scale-95',
    outline: 'border-2 border-emerald-600 text-emerald-400 hover:bg-emerald-500/10 active:scale-95'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}


