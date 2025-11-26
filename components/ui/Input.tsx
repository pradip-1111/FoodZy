import React, { InputHTMLAttributes, forwardRef } from 'react'
import styles from './Input.module.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helperText?: string
    icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, icon, className = '', ...props }, ref) => {
        return (
            <div className={styles.inputWrapper}>
                {label && (
                    <label htmlFor={props.id} className={styles.label}>
                        {label}
                        {props.required && <span className={styles.required}>*</span>}
                    </label>
                )}
                <div className={styles.inputContainer}>
                    {icon && <span className={styles.icon}>{icon}</span>}
                    <input
                        ref={ref}
                        className={`${styles.input} ${error ? styles.error : ''} ${icon ? styles.withIcon : ''
                            } ${className}`}
                        {...props}
                    />
                </div>
                {error && <span className={styles.errorText}>{error}</span>}
                {helperText && !error && (
                    <span className={styles.helperText}>{helperText}</span>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export default Input
