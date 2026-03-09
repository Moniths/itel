import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Newspaper } from 'lucide-react';

interface Post {
    id: string;
    content: string;
    created_at: string;
}

export const NewsFeed = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching posts:', error);
        } else {
            setPosts(data || []);
        }
        setLoading(false);
    };

    if (loading) return null;
    if (posts.length === 0) return null;

    return (
        <section className="max-w-5xl mx-auto px-4 py-12" id="feed">
            <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-1 bg-primary rounded-full"></div>
                <h2 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-bold tracking-tight">Últimas Actualizações</h2>
            </div>

            <div className="grid gap-6">
                {posts.map((post) => (
                    <div key={post.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-2 text-primary mb-3">
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">
                                {new Date(post.created_at).toLocaleString()}
                            </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {post.content}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
};
