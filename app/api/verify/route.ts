import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyDataIntegrity, getExplorerUrl, formatHash, HarvestBatchData } from '@/lib/blockchain';

// Initialize Supabase client
function getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
        return createClient(supabaseUrl, supabaseKey);
    }
    return null;
}

// GET: Verify a batch by QR code ID (public endpoint)
export async function GET(request: NextRequest) {
    const supabase = getSupabaseClient();

    if (!supabase) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const qrCodeId = searchParams.get('qr_code_id');
    const batchId = searchParams.get('batch_id');

    if (!qrCodeId && !batchId) {
        return NextResponse.json({ error: 'QR code ID or batch ID required' }, { status: 400 });
    }

    try {
        let query = supabase.from('harvest_batches').select('*');

        if (qrCodeId) {
            query = query.eq('qr_code_id', qrCodeId);
        } else if (batchId) {
            query = query.eq('id', batchId);
        }

        const { data: batch, error } = await query.single();

        if (error || !batch) {
            return NextResponse.json({
                error: 'Batch not found',
                verified: false
            }, { status: 404 });
        }

        // Check if blockchain verified
        const isBlockchainVerified = !!batch.blockchain_tx_hash;

        // If verified, check data integrity
        let integrityValid = false;
        if (isBlockchainVerified && batch.data_hash) {
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
            integrityValid = verifyDataIntegrity(batchData, batch.data_hash);
        }

        // Build verification response
        const verification = {
            verified: isBlockchainVerified,
            integrityValid,
            dataHash: batch.data_hash ? formatHash(batch.data_hash) : null,
            txHash: batch.blockchain_tx_hash ? formatHash(batch.blockchain_tx_hash) : null,
            blockNumber: batch.blockchain_block_number,
            network: batch.blockchain_network,
            explorerUrl: batch.blockchain_tx_hash
                ? getExplorerUrl(batch.blockchain_tx_hash, batch.blockchain_network)
                : null,
            verifiedAt: batch.blockchain_verified_at,
        };

        // Return batch info for public display (sanitized)
        const publicBatchInfo = {
            qrCodeId: batch.qr_code_id,
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
            certifications: batch.certifications,
            status: batch.status,
        };

        return NextResponse.json({
            batch: publicBatchInfo,
            verification,
        });
    } catch (error) {
        console.error('Error verifying batch:', error);
        return NextResponse.json({
            error: 'Verification failed',
            verified: false
        }, { status: 500 });
    }
}
