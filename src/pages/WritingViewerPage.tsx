import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWritingStore } from '../stores/useWritingStore';
import ReactMarkdown from 'react-markdown';

const WritingViewerPage: React.FC = () => {
    // This hook from React Router gets the ':writingId' from the URL.
    const { writingId } = useParams<{ writingId: string }>();
    // We find the specific manuscript in our library.
    const writing = useWritingStore(state => state.writings.find(w => w.id === writingId));

    if (!writing) {
        return (
            <div className="text-center p-12">
                <h2 className="text-2xl text-ink-brown">Manuscript not found.</h2>
                <Link to="/writing-room" className="text-gold-leaf mt-4 inline-block">Return to the Library</Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-3xl mx-auto p-4 sm:p-8 animate-fade-in">
            <header className="mb-8 pb-4 border-b border-ink-brown/20">
                <h1 className="text-5xl font-bold font-serif text-ink-brown">{writing.title}</h1>
                <div className="flex justify-between items-center mt-2 text-xs text-ink-brown/60">
                    <span>Created: {new Date(writing.createdAt).toLocaleString()}</span>
                    <span>Updated: {new Date(writing.updatedAt).toLocaleString()}</span>
                </div>
                {writing.tags && writing.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {writing.tags.map(tag => (
                            <span key={tag} className="text-xs bg-ink-brown/10 text-ink-brown/80 px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                    </div>
                )}
            </header>
            <article className="prose prose-lg prose-headings:font-serif prose-headings:text-ink-brown prose-p:text-ink-brown/90 prose-strong:text-ink-brown max-w-none">
                <ReactMarkdown>{writing.content}</ReactMarkdown>
            </article>
            <div className="mt-12 text-center">
                <Link to="/writing-room" className="text-gold-leaf hover:text-ink-brown transition-colors">
                    ← Return to the Library
                </Link>
            </div>
        </div>
    );
};

export default WritingViewerPage;