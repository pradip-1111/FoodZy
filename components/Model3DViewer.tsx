'use client'

import { useEffect, useRef } from 'react'

interface Model3DViewerProps {
    modelPath: string
    scale?: number
}

export default function Model3DViewer({ modelPath }: Model3DViewerProps) {
    const viewerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Dynamically import model-viewer to avoid SSR issues
        import('@google/model-viewer')
    }, [])

    return (
        <div ref={viewerRef} style={{ width: '100%', height: '100%' }}>
            <model-viewer
                src={modelPath}
                alt="3D food model"
                auto-rotate
                camera-controls
                shadow-intensity="1"
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    )
}
