import { NextResponse } from 'next/server';

// Sample sensor data (same as the Python backend)
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

function analyzeSampleData() {
    const temperatures = SAMPLE_SENSOR_DATA.map((d) => d.Temperature);
    const humidities = SAMPLE_SENSOR_DATA.map((d) => d.Humidity);
    const moistures = SAMPLE_SENSOR_DATA.map((d) => d.Moisture);
    const motorOnCount = SAMPLE_SENSOR_DATA.filter((d) => d.Motor_State === 'ON').length;

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const avgTemperature = avg(temperatures);
    const avgHumidity = avg(humidities);
    const avgMoisture = avg(moistures);

    // Determine trends
    const tempTrend =
        temperatures[temperatures.length - 1] > temperatures[0] ? 'increasing' : 'decreasing';
    const humidityTrend =
        humidities[humidities.length - 1] > humidities[0] ? 'increasing' : 'decreasing';

    // Determine moisture condition
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
        motor_on_percentage: Math.round((motorOnCount / SAMPLE_SENSOR_DATA.length) * 100 * 100) / 100,
        latest_reading: new Date().toISOString(),
        sample_data: true,
        total_records: SAMPLE_SENSOR_DATA.length,
        temperature_trend: tempTrend,
        humidity_trend: humidityTrend,
        moisture_trend: 'fluctuating',
        moisture_condition: moistureCondition,
    };
}

export async function GET() {
    const analysis = analyzeSampleData();
    return NextResponse.json({
        sample_data: SAMPLE_SENSOR_DATA,
        analysis,
    });
}
