import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryItem {
    id: string;
    image_url: string;
}

export const GalleryCarousel = () => {
    const [images, setImages] = useState<GalleryItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchImages();
    }, []);

    useEffect(() => {
        if (images.length > 1) {
            const timer = setInterval(() => {
                nextSlide();
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [currentIndex, images.length]);

    const fetchImages = async () => {
        const { data } = await supabase
            .from('gallery')
            .select('*')
            .order('created_at', { ascending: false });

        setImages(data || []);
        setLoading(false);
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const getImageUrl = (path: string) => {
        const { data } = supabase.storage.from('gallery').getPublicUrl(path);
        return data.publicUrl;
    };

    if (loading || images.length === 0) {
        return (
            <div className="w-full aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center animate-pulse">
                <p className="text-slate-400 font-medium italic">Carregando galeria...</p>
            </div>
        );
    }

    return (
        <div className="relative group w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            {/* Slides */}
            <div className="w-full h-full relative">
                {images.map((img, index) => (
                    <div
                        key={img.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        <img
                            src={getImageUrl(img.image_url)}
                            alt="Evento Passado"
                            className="w-full h-full object-cover"
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </>
            )}

            {/* Indicators */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`size-2 rounded-full transition-all ${index === currentIndex ? 'bg-white w-6' : 'bg-white/40'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
