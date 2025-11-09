import React, { useState, useEffect } from 'react';
import { Lightbulb, AlertTriangle } from 'lucide-react';
import type { Prospect, Deal } from '../types';
import { generateDashboardBriefing } from '../services/aiService';
import { Card, CardContent } from './ui/Card';
import { Skeleton } from './ui/Skeleton';

interface AIDailyBriefingProps {
    prospects: Prospect[];
    deals: Deal[];
}

export const AIDailyBriefing: React.FC<AIDailyBriefingProps> = ({ prospects, deals }) => {
    const [insights, setInsights] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBriefing = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const { insights: fetchedInsights } = await generateDashboardBriefing(prospects, deals);
                setInsights(fetchedInsights);
            } catch (err) {
                console.error("Failed to fetch AI briefing:", err);
                setError("Could not load AI briefing.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchBriefing();
    }, [prospects, deals]);

    return (
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-900/30">
            <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                    AI Daily Briefing
                </h3>
                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                ) : error ? (
                    <div className="flex items-center text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        <p>{error}</p>
                    </div>
                ) : (
                    <ul className="space-y-2 list-disc list-inside text-sm text-gray-700 dark:text-slate-300">
                        {insights.map((insight, index) => (
                            <li key={index}>{insight}</li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
};