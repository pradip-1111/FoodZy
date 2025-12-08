'use client'

import { motion } from 'framer-motion'
import Button from './Button'
import { ComponentProps } from 'react'

type ButtonProps = ComponentProps<typeof Button>

const MotionButton = motion(Button)

interface AnimatedButtonProps extends ButtonProps {
    whileHoverScale?: number
    whileTapScale?: number
}

export default function AnimatedButton({
    whileHoverScale = 1.02,
    whileTapScale = 0.98,
    children,
    ...props
}: AnimatedButtonProps) {
    return (
        // @ts-ignore
        <MotionButton
            {...props}
            whileHover={{ scale: whileHoverScale }}
            whileTap={{ scale: whileTapScale }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
            {children}
        </MotionButton>
    )
}
