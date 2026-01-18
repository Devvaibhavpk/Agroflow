import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateNFTMetadata, HarvestBatchData } from '@/lib/blockchain';

// Initialize Supabase client
function getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
        return createClient(supabaseUrl, supabaseKey);
    }
    return null;
}

// GET: Fetch NFT metadata for a batch (OpenSea compatible)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const qrCodeId = searchParams.get('qr_code_id');

    if (!qrCodeId) {
        return NextResponse.json({ error: 'QR code ID required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Demo metadata if no database
    if (!supabase) {
        const demoMetadata = {
            name: `Organic Tomatoes - Batch ${qrCodeId}`,
            description: `Blockchain-verified harvest batch of Organic Tomatoes (Roma) from Bangalore, Karnataka. This NFT certifies the authenticity and complete growing history of this produce batch.`,
            image: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/nft-image/${qrCodeId}`,
            external_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify/${qrCodeId}`,
            attributes: [
                { trait_type: 'Crop', value: 'Tomatoes' },
                { trait_type: 'Variety', value: 'Roma' },
                { trait_type: 'Farm Location', value: 'Bangalore, Karnataka' },
                { trait_type: 'Organic', value: 'Yes' },
                { trait_type: 'Pesticide-Free', value: 'Yes' },
                { trait_type: 'Quality Grade', value: 'Premium' },
                { trait_type: 'Avg Temperature (°C)', value: 27.5 },
                { trait_type: 'Avg Humidity (%)', value: 62 },
                { trait_type: 'Verified By', value: 'Agroflow' },
            ],
        };
        return NextResponse.json(demoMetadata);
    }

    try {
        const { data: batch, error } = await supabase
            .from('harvest_batches')
            .select('*')
            .eq('qr_code_id', qrCodeId)
            .single();

        if (error || !batch) {
            return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
        }

        // Convert to HarvestBatchData format
        const batchData: HarvestBatchData = {
            id: batch.id,
            cropName: batch.crop_name,
            cropVariety: batch.crop_variety,
            plantingDate: batch.planting_date,
            harvestDate: batch.harvest_date,
            quantityKg: batch.quantity_kg,
            zoneName: batch.zone_name,
            farmLocation: batch.farm_location,
            avgTemperature: batch.avg_temperature,
            avgHumidity: batch.avg_humidity,
            avgMoisture: batch.avg_moisture,
            isOrganic: batch.is_organic,
            isPesticideFree: batch.is_pesticide_free,
            qualityGrade: batch.quality_grade,
        };

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const metadata = generateNFTMetadata(batchData, qrCodeId, baseUrl);

        return NextResponse.json(metadata);
    } catch (error) {
        console.error('Error fetching NFT metadata:', error);
        return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
    }
}
