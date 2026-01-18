import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Sample sensor data for context
const SAMPLE_SENSOR_DATA = [
    { ID: 1, Temperature: 37.8, Humidity: 87.8, Moisture: 37.45, Motor_State: 'ON' },
    { ID: 2, Temperature: 37.9, Humidity: 87.6, Moisture: 95.07, Motor_State: 'ON' },
    { ID: 3, Temperature: 38.1, Humidity: 87.0, Moisture: 73.2, Motor_State: 'OFF' },
    { ID: 4, Temperature: 38.3, Humidity: 86.6, Moisture: 59.87, Motor_State: 'OFF' },
    { ID: 5, Temperature: 38.4, Humidity: 85.7, Moisture: 15.6, Motor_State: 'OFF' },
    { ID: 6, Temperature: 38.6, Humidity: 85.4, Moisture: 15.6, Motor_State: 'OFF' },
    { ID: 7, Temperature: 38.8, Humidity: 84.3, Moisture: 5.81, Motor_State: 'OFF' },
    { ID: 8, Temperature: 39.0, Humidity: 83.4, Moisture: 86.62, Motor_State: 'ON' },
    { ID: 9, Temperature: 39.2, Humidity: 82.5, Moisture: 60.11, Motor_State: 'OFF' },
    { ID: 10, Temperature: 39.4, Humidity: 82.2, Moisture: 70.81, Motor_State: 'OFF' },
    { ID: 11, Temperature: 39.7, Humidity: 81.4, Moisture: 2.06, Motor_State: 'ON' },
    { ID: 12, Temperature: 39.9, Humidity: 78.4, Moisture: 96.99, Motor_State: 'OFF' },
    { ID: 13, Temperature: 40.2, Humidity: 79.6, Moisture: 83.24, Motor_State: 'ON' },
    { ID: 14, Temperature: 40.5, Humidity: 79.3, Moisture: 21.23, Motor_State: 'OFF' },
    { ID: 15, Temperature: 41.0, Humidity: 79.4, Moisture: 18.18, Motor_State: 'ON' },
    { ID: 16, Temperature: 41.5, Humidity: 76.3, Moisture: 18.34, Motor_State: 'OFF' },
    { ID: 17, Temperature: 41.7, Humidity: 78.6, Moisture: 30.42, Motor_State: 'OFF' },
    { ID: 18, Temperature: 42.3, Humidity: 76.9, Moisture: 52.48, Motor_State: 'ON' },
    { ID: 19, Temperature: 42.6, Humidity: 80.9, Moisture: 43.19, Motor_State: 'ON' },
    { ID: 20, Temperature: 43.2, Humidity: 83.1, Moisture: 29.12, Motor_State: 'ON' },
];

// Blockchain/NFT context for the chatbot
const BLOCKCHAIN_CONTEXT = {
    network: 'Polygon Amoy Testnet',
    nft_contract: 'AgroflowNFT (ERC-721)',
    features: [
        'Each harvest batch is minted as an NFT',
        'QR codes link to blockchain verification',
        'Data hash ensures crop data integrity',
        'OpenSea integration for NFT viewing',
        'Immutable provenance tracking'
    ],
    benefits: [
        'Consumers can verify product origin',
        'Tamper-proof growing condition records',
        'Premium pricing for verified organic produce',
        'Supply chain transparency'
    ]
};

// Language map for response generation
const LANGUAGE_MAP: Record<string, string> = {
    english: 'Respond in English.',
    hindi: 'Respond in Hindi (हिन्दी).',
    tamil: 'Respond in Tamil (தமிழ்).',
    telugu: 'Respond in Telugu (తెలుగు).',
    malayalam: 'Respond in Malayalam (മലയാളം).',
    punjabi: 'Respond in Punjabi (ਪੰਜਾਬੀ).',
    marathi: 'Respond in Marathi (मराठी).',
    kannada: 'Respond in Kannada (ಕನ್ನಡ).',
};

function analyzeSampleData() {
    const temperatures = SAMPLE_SENSOR_DATA.map((d) => d.Temperature);
    const humidities = SAMPLE_SENSOR_DATA.map((d) => d.Humidity);
    const moistures = SAMPLE_SENSOR_DATA.map((d) => d.Moisture);
    const motorOnCount = SAMPLE_SENSOR_DATA.filter((d) => d.Motor_State === 'ON').length;

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const avgTemperature = avg(temperatures);
    const avgHumidity = avg(humidities);
    const avgMoisture = avg(moistures);

    const tempTrend = temperatures[temperatures.length - 1] > temperatures[0] ? 'increasing' : 'decreasing';
    const humidityTrend = humidities[humidities.length - 1] > humidities[0] ? 'increasing' : 'decreasing';

    let moistureCondition = 'moist';
    if (avgMoisture < 20) moistureCondition = 'dry';
    else if (avgMoisture < 50) moistureCondition = 'moderate';

    return {
        avg_temperature: Math.round(avgTemperature * 100) / 100,
        avg_humidity: Math.round(avgHumidity * 100) / 100,
        avg_moisture: Math.round(avgMoisture * 100) / 100,
        max_temperature: Math.max(...temperatures),
        min_temperature: Math.min(...temperatures),
        max_humidity: Math.max(...humidities),
        min_humidity: Math.min(...humidities),
        max_moisture: Math.max(...moistures),
        min_moisture: Math.min(...moistures),
        motor_on_percentage: Math.round((motorOnCount / SAMPLE_SENSOR_DATA.length) * 100),
        temperature_trend: tempTrend,
        humidity_trend: humidityTrend,
        moisture_condition: moistureCondition,
        total_records: SAMPLE_SENSOR_DATA.length,
    };
}

async function generateAIResponse(question: string, language: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const sensorData = analyzeSampleData();
    const languageInstruction = LANGUAGE_MAP[language.toLowerCase()] || LANGUAGE_MAP['english'];

    // Models ordered by availability (based on rate limits)
    // gemini-2.5-flash-lite: 10 RPM, 20 RPD - best for free tier
    // gemini-2.5-flash: 5 RPM, 20 RPD
    // gemma-3-4b: 30 RPM, 14.4K RPD - high limit but smaller model
    const modelsToTry = [
        'gemini-2.5-flash-lite',  // 10 RPM, 20 RPD - most available
        'gemini-2.5-flash',       // 5 RPM, 20 RPD
        'gemini-1.5-flash',       // fallback
    ];

    const prompt = `You are AgroBot 🌾, an AI assistant for Agroflow - a smart agriculture platform with IoT sensors and blockchain-based crop traceability.

## Your Capabilities:
1. **Sensor Data Analysis** - Real-time farm monitoring
2. **Blockchain/NFT Traceability** - Each harvest is minted as an NFT on Polygon
3. **Crop Recommendations** - Based on conditions
4. **Irrigation Advice** - Smart water management

## Current Sensor Data:
- 🌡️ Temperature: ${sensorData.avg_temperature}°C (${sensorData.temperature_trend}, range: ${sensorData.min_temperature}-${sensorData.max_temperature}°C)
- 💧 Humidity: ${sensorData.avg_humidity}% (${sensorData.humidity_trend})
- 🌱 Soil Moisture: ${sensorData.avg_moisture}% (${sensorData.moisture_condition})
- 🚿 Irrigation Active: ${sensorData.motor_on_percentage}% of the time

## Blockchain Features:
- Network: ${BLOCKCHAIN_CONTEXT.network}
- NFT Standard: ${BLOCKCHAIN_CONTEXT.nft_contract}
- Features: ${BLOCKCHAIN_CONTEXT.features.join(', ')}

## User Question: ${question}

## Instructions:
- Be helpful, friendly, and concise
- Use emojis to make responses engaging
- Reference sensor data when relevant
- Explain blockchain/NFT features if asked
- Provide actionable farming advice
- ${languageInstruction}

Respond naturally as a helpful farm assistant:`;

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const text = result.response.text();

            if (text) {
                console.log(`✅ Response generated using: ${modelName}`);
                return text;
            }
        } catch {
            console.log(`⚠️ Model ${modelName} failed, trying next...`);
            continue;
        }
    }

    throw new Error('All AI models failed - quota exhausted');
}

// Smart fallback when API is unavailable
function generateFallbackResponse(sensorData: ReturnType<typeof analyzeSampleData>, question?: string): string {
    const { avg_temperature, avg_humidity, avg_moisture, moisture_condition, temperature_trend } = sensorData;
    const q = (question || '').toLowerCase();

    // Blockchain/NFT questions
    if (q.includes('blockchain') || q.includes('nft') || q.includes('verify') || q.includes('trace')) {
        return `🔗 **Blockchain Traceability**

Agroflow uses **Polygon blockchain** to create NFT certificates for each harvest batch.

**How it works:**
1. 📝 Farmer creates a harvest batch with crop details
2. 🌡️ Sensor data (temp, humidity, moisture) is recorded
3. 💎 Batch is minted as an ERC-721 NFT
4. 📱 QR code links to verification page
5. ✅ Consumers can verify origin by scanning

**Benefits:**
- Immutable proof of organic/pesticide-free claims
- Premium pricing for verified produce
- Consumer trust through transparency

Visit the **Traceability** page to mint NFTs for your batches!`;
    }

    // Water/Irrigation questions
    if (q.includes('water') || q.includes('irrigat') || q.includes('moisture')) {
        if (avg_moisture < 30) {
            return `💧 **Irrigation Needed**

Current soil moisture: **${avg_moisture}%** (${moisture_condition})

⚠️ Your soil is dry. I recommend starting irrigation within the next 2-3 hours to prevent crop stress.

**Tip:** Check the Dashboard for real-time moisture updates.`;
        }
        return `💧 **Moisture Status: Good**

Current soil moisture: **${avg_moisture}%**

✅ No immediate irrigation needed. Your crops have adequate water.`;
    }

    // Temperature questions
    if (q.includes('temp') || q.includes('hot') || q.includes('cold')) {
        return `🌡️ **Temperature Analysis**

Current: **${avg_temperature}°C** (${temperature_trend})
Range: ${sensorData.min_temperature}°C - ${sensorData.max_temperature}°C

${avg_temperature > 38 ? '⚠️ High temperature detected. Consider shade nets for sensitive crops.' : '✅ Temperature is within safe range for most crops.'}`;
    }

    // Default response
    return `🌾 **AgroBot Farm Summary**

📊 **Current Conditions:**
- 🌡️ Temperature: ${avg_temperature}°C (${temperature_trend})
- 💧 Humidity: ${avg_humidity}%
- 🌱 Soil Moisture: ${avg_moisture}% (${moisture_condition})

🔗 **Blockchain Features:**
- Mint harvest batches as NFTs
- QR code verification for consumers
- Polygon network for low gas fees

💡 **Quick Tips:**
${avg_moisture < 30 ? '• Irrigation recommended soon\n' : ''}${avg_temperature > 40 ? '• Provide shade for heat-sensitive crops\n' : ''}• Check Traceability page to manage batches

_Ask me about irrigation, temperature, crops, or blockchain!_`;
}

export async function POST(request: NextRequest) {
    let question = '';

    try {
        const body = await request.json();
        question = body.question || '';
        const language = body.language || 'english';

        if (!question || typeof question !== 'string') {
            return NextResponse.json(
                { error: 'Question is required and must be a string' },
                { status: 400 }
            );
        }

        const answer = await generateAIResponse(question, language);
        return NextResponse.json({ answer });
    } catch (error) {
        console.error('Chatbot error:', error);
        const errorMessage = error instanceof Error ? error.message : '';

        // Use smart fallback for rate limits
        if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('exhausted')) {
            const sensorData = analyzeSampleData();
            const fallbackResponse = generateFallbackResponse(sensorData, question);
            return NextResponse.json({
                answer: fallbackResponse,
                isOffline: true
            });
        }

        return NextResponse.json(
            { error: 'Failed to process question' },
            { status: 500 }
        );
    }
}
