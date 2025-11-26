declare namespace JSX {
    interface IntrinsicElements {
        'model-viewer': ModelViewerJSX & React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
}

interface ModelViewerJSX {
    src: string;
    alt?: string;
    'auto-rotate'?: boolean;
    'camera-controls'?: boolean;
    'shadow-intensity'?: string;
    ar?: boolean;
    'ar-modes'?: string;
    'auto-rotate-delay'?: string;
    'rotation-per-second'?: string;
}
