import React from 'react'
import styles from './Loader.module.css'

interface LoaderProps {
    size?: 'sm' | 'md' | 'lg'
    fullScreen?: boolean
}

export default function Loader({ size = 'md', fullScreen = false }: LoaderProps) {
    if (fullScreen) {
        return (
            <div className={styles.fullScreen}>
                <div className={`${styles.spinner} ${styles[size]}`}>
                    <div className={styles.circle}></div>
                    <div className={styles.circle}></div>
                    <div className={styles.circle}></div>
                </div>
            </div>
        )
    }

    return (
        <div className={`${styles.spinner} ${styles[size]}`}>
            <div className={styles.circle}></div>
            <div className={styles.circle}></div>
            <div className={styles.circle}></div>
        </div>
    )
}
