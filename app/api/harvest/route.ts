import { NextRequest, NextResponse } from 'next/server';
import { hashBatchData, simulateBlockchainWrite, simulateNFTMint, HarvestBatchData } from '@/lib/blockchain';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
function getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
        return createClient(supabaseUrl, supabaseKey);
    }
    return null;
}

// GET: Fetch harvest batches
export async function GET(request: NextRequest) {
    const supabase = getSupabaseClient();

    if (!supabase) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const qrCodeId = searchParams.get('qr_code_id');

    try {
        let query = supabase
            .from('harvest_batches')
            .select('*')
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        if (qrCodeId) {
            query = query.eq('qr_code_id', qrCodeId);
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json({ batches: data });
    } catch (error) {
        console.error('Error fetching batches:', error);
        return NextResponse.json({ error: 'Failed to fetch batches' }, { status: 500 });
    }
}

// POST: Create new harvest batch
export async function POST(request: NextRequest) {
    const supabase = getSupabaseClient();

    if (!supabase) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    try {
        const body = await request.json();

        const { data, error } = await supabase
            .from('harvest_batches')
            .insert([{
                crop_name: body.cropName,
                crop_variety: body.cropVariety,
                planting_date: body.plantingDate,
                harvest_date: body.harvestDate,
                quantity_kg: body.quantityKg,
                zone_name: body.zoneName,
                farm_location: body.farmLocation,
                is_organic: body.isOrganic || false,
                is_pesticide_free: body.isPesticideFree || false,
                quality_grade: body.qualityGrade,
                certifications: body.certifications,
                notes: body.notes,
                status: body.harvestDate ? 'harvested' : 'growing',
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ batch: data });
    } catch (error) {
        console.error('Error creating batch:', error);
        return NextResponse.json({ error: 'Failed to create batch' }, { status: 500 });
    }
}

// PUT: Update batch and optionally verify on blockchain
export async function PUT(request: NextRequest) {
    const supabase = getSupabaseClient();

    if (!supabase) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { id, verify, ...updateData } = body;

        if (!id) {
            return NextResponse.json({ error: 'Batch ID required' }, { status: 400 });
        }

        // If verify flag is set, perform blockchain verification
        if (verify) {
            // Fetch current batch data
            const { data: batch, error: fetchError } = await supabase
                .from('harvest_batches')
                .select('*')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;

            // Prepare data for hashing
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

            // Generate hash and simulate blockchain write
            const dataHash = hashBatchData(batchData);
            const verification = await simulateBlockchainWrite(dataHash);

            // Update batch with blockchain info
            const { data: updatedBatch, error: updateError } = await supabase
                .from('harvest_batches')
                .update({
                    data_hash: verification.dataHash,
                    blockchain_tx_hash: verification.txHash,
                    blockchain_block_number: verification.blockNumber,
                    blockchain_verified_at: verification.timestamp,
                    blockchain_network: verification.network,
                    status: 'verified',
                })
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;

            // Log the blockchain transaction
            await supabase.from('blockchain_logs').insert([{
                batch_id: id,
                data_hash: verification.dataHash,
                tx_hash: verification.txHash,
                block_number: verification.blockNumber,
                network: verification.network,
                status: 'confirmed',
                confirmed_at: verification.timestamp,
            }]);

            return NextResponse.json({
                batch: updatedBatch,
                verification
            });
        }

        // If mintNft flag is set, mint the batch as an NFT
        if (body.mintNft) {
            // Fetch current batch data
            const { data: batch, error: fetchError } = await supabase
                .from('harvest_batches')
                .select('*')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;

            // Prepare data for NFT
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

            // Generate hash first (for data integrity)
            const dataHash = hashBatchData(batchData);

            // Mint NFT
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const nftResult = await simulateNFTMint(batchData, batch.qr_code_id, baseUrl);

            // Update batch with NFT and blockchain info
            const { data: updatedBatch, error: updateError } = await supabase
                .from('harvest_batches')
                .update({
                    data_hash: dataHash,
                    blockchain_tx_hash: nftResult.txHash,
                    blockchain_block_number: nftResult.blockNumber,
                    blockchain_verified_at: nftResult.timestamp,
                    blockchain_network: nftResult.network,
                    nft_token_id: nftResult.tokenId,
                    nft_contract_address: nftResult.contractAddress,
                    nft_metadata_uri: nftResult.metadataUri,
                    nft_opensea_url: nftResult.openSeaUrl,
                    nft_minted_at: nftResult.timestamp,
                    status: 'minted',
                })
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;

            // Log the NFT minting transaction
            await supabase.from('blockchain_logs').insert([{
                batch_id: id,
                data_hash: dataHash,
                tx_hash: nftResult.txHash,
                block_number: nftResult.blockNumber,
                network: nftResult.network,
                status: 'confirmed',
                confirmed_at: nftResult.timestamp,
            }]);

            return NextResponse.json({
                batch: updatedBatch,
                nft: nftResult
            });
        }

        // Regular update without blockchain verification
        const updatePayload: Record<string, unknown> = {};
        if (updateData.cropName) updatePayload.crop_name = updateData.cropName;
        if (updateData.cropVariety) updatePayload.crop_variety = updateData.cropVariety;
        if (updateData.plantingDate) updatePayload.planting_date = updateData.plantingDate;
        if (updateData.harvestDate) updatePayload.harvest_date = updateData.harvestDate;
        if (updateData.quantityKg) updatePayload.quantity_kg = updateData.quantityKg;
        if (updateData.zoneName) updatePayload.zone_name = updateData.zoneName;
        if (updateData.farmLocation) updatePayload.farm_location = updateData.farmLocation;
        if (updateData.isOrganic !== undefined) updatePayload.is_organic = updateData.isOrganic;
        if (updateData.isPesticideFree !== undefined) updatePayload.is_pesticide_free = updateData.isPesticideFree;
        if (updateData.qualityGrade) updatePayload.quality_grade = updateData.qualityGrade;
        if (updateData.status) updatePayload.status = updateData.status;
        if (updateData.notes) updatePayload.notes = updateData.notes;

        // Blockchain fields (sent directly from frontend after MetaMask minting)
        if (updateData.blockchain_tx_hash) updatePayload.blockchain_tx_hash = updateData.blockchain_tx_hash;
        if (updateData.blockchain_block_number) updatePayload.blockchain_block_number = updateData.blockchain_block_number;
        if (updateData.blockchain_verified_at) updatePayload.blockchain_verified_at = updateData.blockchain_verified_at;
        if (updateData.blockchain_network) updatePayload.blockchain_network = updateData.blockchain_network;
        if (updateData.data_hash) updatePayload.data_hash = updateData.data_hash;

        // NFT fields
        if (updateData.nft_token_id) updatePayload.nft_token_id = updateData.nft_token_id;
        if (updateData.nft_contract_address) updatePayload.nft_contract_address = updateData.nft_contract_address;
        if (updateData.nft_metadata_uri) updatePayload.nft_metadata_uri = updateData.nft_metadata_uri;
        if (updateData.nft_opensea_url) updatePayload.nft_opensea_url = updateData.nft_opensea_url;
        if (updateData.nft_minted_at) updatePayload.nft_minted_at = updateData.nft_minted_at;

        updatePayload.updated_at = new Date().toISOString();

        console.log('🔄 Updating batch with payload:', JSON.stringify(updatePayload, null, 2));

        const { data, error } = await supabase
            .from('harvest_batches')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('❌ Database update error:', error);
            throw error;
        }

        console.log('✅ Database updated successfully. New data:', JSON.stringify(data, null, 2));

        return NextResponse.json({ batch: data });
    } catch (error) {
        console.error('Error updating batch:', error);
        return NextResponse.json({ error: 'Failed to update batch' }, { status: 500 });
    }
}
