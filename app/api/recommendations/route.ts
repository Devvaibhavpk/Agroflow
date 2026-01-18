import { NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build-time errors
let supabase: SupabaseClient | null = null;

function getSupabaseClient() {
    if (!supabase && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
    }
    return supabase;
}

interface CropRecommendation {
    name: string;
    category: string;
    matchScore: number;
    reasons: string[];
    tips: string[];
    daysToHarvest: number;
    waterRequirement: string;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const temperature = parseFloat(searchParams.get('temperature') || '25');
    const moisture = parseFloat(searchParams.get('moisture') || '50');

    const client = getSupabaseClient();

    if (!client) {
        return NextResponse.json({
            recommendations: getMockRecommendations(temperature, moisture),
            isMockData: true
        });
    }

    try {
        const { data: crops, error } = await client
            .from('crops')
            .select('*');

        if (error) {
            return NextResponse.json({
                recommendations: getMockRecommendations(temperature, moisture),
                isMockData: true
            });
        }

        const recommendations: CropRecommendation[] = crops
            .map(crop => {
                const tempScore = calculateTempScore(temperature, crop.optimal_temp_min, crop.optimal_temp_max);
                const moistureScore = calculateMoistureScore(moisture, crop.optimal_moisture_min, crop.optimal_moisture_max);
                const overallScore = (tempScore + moistureScore) / 2;

                const reasons: string[] = [];

                if (tempScore >= 80) {
                    reasons.push(`Ideal temperature range (${crop.optimal_temp_min}°C - ${crop.optimal_temp_max}°C)`);
                } else if (tempScore >= 50) {
                    reasons.push(`Acceptable temperature conditions`);
                }

                if (moistureScore >= 80) {
                    reasons.push(`Perfect moisture level (${crop.optimal_moisture_min}% - ${crop.optimal_moisture_max}%)`);
                } else if (moistureScore >= 50) {
                    reasons.push(`Suitable moisture conditions`);
                }

                if (crop.water_requirement === 'low' && moisture < 50) {
                    reasons.push(`Low water requirement suits current conditions`);
                }

                return {
                    name: crop.name,
                    category: crop.category,
                    matchScore: Math.round(overallScore),
                    reasons,
                    tips: crop.tips || [],
                    daysToHarvest: crop.days_to_harvest,
                    waterRequirement: crop.water_requirement
                };
            })
            .filter(crop => crop.matchScore >= 40)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 5);

        return NextResponse.json({ recommendations, isMockData: false });
    } catch (error) {
        console.error('Recommendation error:', error);
        return NextResponse.json({
            recommendations: getMockRecommendations(temperature, moisture),
            isMockData: true
        });
    }
}

function calculateTempScore(current: number, min: number, max: number): number {
    if (current >= min && current <= max) {
        const midpoint = (min + max) / 2;
        const halfRange = (max - min) / 2;
        const distance = Math.abs(current - midpoint);
        return 100 - (distance / halfRange) * 20;
    } else if (current < min) {
        const diff = min - current;
        return Math.max(0, 100 - diff * 10);
    } else {
        const diff = current - max;
        return Math.max(0, 100 - diff * 10);
    }
}

function calculateMoistureScore(current: number, min: number, max: number): number {
    if (current >= min && current <= max) {
        return 100;
    } else if (current < min) {
        const diff = min - current;
        return Math.max(0, 100 - diff * 3);
    } else {
        const diff = current - max;
        return Math.max(0, 100 - diff * 3);
    }
}

function getMockRecommendations(temperature: number, moisture: number): CropRecommendation[] {
    const allCrops = [
        { name: 'Tomato', category: 'vegetable', tempMin: 18, tempMax: 29, moistMin: 40, moistMax: 60, water: 'medium', days: 70, tips: ['Stake plants for support', 'Remove suckers'] },
        { name: 'Rice', category: 'grain', tempMin: 20, tempMax: 35, moistMin: 70, moistMax: 90, water: 'high', days: 120, tips: ['Maintain standing water', 'Transplant at 3 weeks'] },
        { name: 'Wheat', category: 'grain', tempMin: 12, tempMax: 25, moistMin: 40, moistMax: 60, water: 'medium', days: 130, tips: ['Avoid waterlogging', 'Apply nitrogen fertilizer'] },
        { name: 'Potato', category: 'vegetable', tempMin: 15, tempMax: 20, moistMin: 60, moistMax: 80, water: 'medium', days: 90, tips: ['Hill soil around plants', 'Avoid frost'] },
        { name: 'Maize', category: 'grain', tempMin: 18, tempMax: 27, moistMin: 50, moistMax: 75, water: 'medium', days: 90, tips: ['Plant in blocks for pollination', 'Harvest when silks brown'] },
    ];

    return allCrops
        .map(crop => {
            const tempScore = calculateTempScore(temperature, crop.tempMin, crop.tempMax);
            const moistScore = calculateMoistureScore(moisture, crop.moistMin, crop.moistMax);
            const score = (tempScore + moistScore) / 2;

            return {
                name: crop.name,
                category: crop.category,
                matchScore: Math.round(score),
                reasons: [`Suitable for ${temperature}°C and ${moisture}% moisture`],
                tips: crop.tips,
                daysToHarvest: crop.days,
                waterRequirement: crop.water
            };
        })
        .filter(c => c.matchScore >= 40)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);
}
