import React, { ButtonHTMLAttributes, forwardRef } from 'react'
import styles from './Button.module.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    fullWidth?: boolean
    loading?: boolean
    children: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    disabled,
    children,
    className = '',
    ...props
}, ref) => {
    const classes = [
        styles.button,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : '',
        loading ? styles.loading : '',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <button
            ref={ref}
            className={classes}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <span className={styles.spinner}>
                    <span className="animate-spin">⟳</span>
                </span>
            )}
            <span className={loading ? styles.loadingText : ''}>{children}</span>
        </button>
    )
})

Button.displayName = 'Button'

export default Button
