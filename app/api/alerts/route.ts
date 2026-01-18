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

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    const client = getSupabaseClient();

    if (!client) {
        return NextResponse.json({
            alerts: getMockAlerts(),
            isMockData: true
        });
    }

    try {
        let query = client
            .from('alerts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (userId) {
            query = query.eq('user_id', userId);
        }

        if (unreadOnly) {
            query = query.eq('is_read', false);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({
                alerts: getMockAlerts(),
                isMockData: true
            });
        }

        return NextResponse.json({ alerts: data, isMockData: false });
    } catch (error) {
        console.error('Alerts API error:', error);
        return NextResponse.json({
            alerts: getMockAlerts(),
            isMockData: true
        });
    }
}

export async function PATCH(request: Request) {
    const client = getSupabaseClient();

    if (!client) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { alertId, action } = body;

        if (action === 'markRead') {
            const { error } = await client
                .from('alerts')
                .update({ is_read: true })
                .eq('id', alertId);

            if (error) throw error;
        } else if (action === 'markAllRead') {
            const { error } = await client
                .from('alerts')
                .update({ is_read: true })
                .eq('is_read', false);

            if (error) throw error;
        } else if (action === 'dismiss') {
            const { error } = await client
                .from('alerts')
                .update({ is_dismissed: true })
                .eq('id', alertId);

            if (error) throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Alert update error:', error);
        return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 });
    }
}

function getMockAlerts() {
    const now = new Date();
    return [
        {
            id: '1',
            type: 'low_moisture',
            severity: 'warning',
            title: 'Low Soil Moisture Alert',
            message: 'Soil moisture dropped to 28%. Consider starting irrigation.',
            sensor_value: 28,
            threshold_value: 30,
            is_read: false,
            created_at: new Date(now.getTime() - 30 * 60000).toISOString()
        },
        {
            id: '2',
            type: 'recommendation',
            severity: 'info',
            title: 'Crop Recommendation',
            message: 'Based on current conditions, Tomato and Maize are ideal crops for your farm.',
            is_read: false,
            created_at: new Date(now.getTime() - 2 * 3600000).toISOString()
        },
        {
            id: '3',
            type: 'high_temp',
            severity: 'critical',
            title: 'High Temperature Warning',
            message: 'Temperature reached 42°C. Crops may experience heat stress.',
            sensor_value: 42,
            threshold_value: 40,
            is_read: true,
            created_at: new Date(now.getTime() - 5 * 3600000).toISOString()
        },
        {
            id: '4',
            type: 'motor_on',
            severity: 'info',
            title: 'Irrigation Started',
            message: 'Automatic irrigation started due to low moisture levels.',
            is_read: true,
            created_at: new Date(now.getTime() - 8 * 3600000).toISOString()
        }
    ];
}
