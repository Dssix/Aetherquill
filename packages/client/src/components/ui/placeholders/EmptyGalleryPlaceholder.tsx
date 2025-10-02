import React from 'react';
import Card from "../Card.tsx";

// This component receives the poetic text and the SVG icon as props.
interface EmptyGalleryPlaceholderProps {
    icon: React.ReactNode;
    title: string;
    message: string;
}

const EmptyGalleryPlaceholder: React.FC<EmptyGalleryPlaceholderProps> = ({ icon, title, message }) => {
    return (
        // We use our trusted Card component as the base.
        // 'relative' allows us to position the icon, and 'overflow-hidden' keeps it contained.
        <Card className="relative overflow-hidden text-center opacity-0 animate-fade-in-up col-span-full">
            {/* This is the watermark icon. It is positioned absolutely behind the text.
          'opacity-5' makes it extremely faint, like a true watermark.
          'pointer-events-none' ensures it doesn't interfere with mouse clicks. */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none -z-10">
                <div className="w-48 h-48 text-foreground">
                    {icon}
                </div>
            </div>

            {/* The new, more poetic text. */}
            <div className="p-8">
                <h2 className="text-2xl font-bold text-foreground">{title}</h2>
                <p className="text-lg text-muted-foreground my-4 leading-relaxed italic">
                    {message}
                </p>
            </div>
        </Card>
    );
};

export default EmptyGalleryPlaceholder;