import { NextResponse } from 'next/server';

interface WeatherData {
    location: {
        name: string;
        region: string;
        country: string;
    };
    current: {
        temp_c: number;
        humidity: number;
        condition: {
            text: string;
            icon: string;
        };
        wind_kph: number;
        feelslike_c: number;
        uv: number;
    };
    forecast?: {
        forecastday: Array<{
            date: string;
            day: {
                maxtemp_c: number;
                mintemp_c: number;
                avghumidity: number;
                daily_chance_of_rain: number;
                condition: {
                    text: string;
                    icon: string;
                };
            };
        }>;
    };
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location') || 'auto:ip';
    const days = searchParams.get('days') || '3';

    // WeatherAPI.com free tier - Get your API key at https://www.weatherapi.com/
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) {
        // Return mock data if no API key is configured
        return NextResponse.json({
            location: {
                name: "Sample Location",
                region: "Demo",
                country: "Demo Country"
            },
            current: {
                temp_c: 28.5,
                humidity: 65,
                condition: {
                    text: "Partly cloudy",
                    icon: "//cdn.weatherapi.com/weather/64x64/day/116.png"
                },
                wind_kph: 12.3,
                feelslike_c: 30.2,
                uv: 6
            },
            forecast: {
                forecastday: [
                    {
                        date: new Date().toISOString().split('T')[0],
                        day: {
                            maxtemp_c: 32,
                            mintemp_c: 24,
                            avghumidity: 70,
                            daily_chance_of_rain: 20,
                            condition: { text: "Sunny", icon: "//cdn.weatherapi.com/weather/64x64/day/113.png" }
                        }
                    },
                    {
                        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                        day: {
                            maxtemp_c: 30,
                            mintemp_c: 23,
                            avghumidity: 75,
                            daily_chance_of_rain: 40,
                            condition: { text: "Partly cloudy", icon: "//cdn.weatherapi.com/weather/64x64/day/116.png" }
                        }
                    },
                    {
                        date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
                        day: {
                            maxtemp_c: 28,
                            mintemp_c: 22,
                            avghumidity: 80,
                            daily_chance_of_rain: 60,
                            condition: { text: "Moderate rain", icon: "//cdn.weatherapi.com/weather/64x64/day/302.png" }
                        }
                    }
                ]
            },
            isMockData: true
        });
    }

    try {
        const response = await fetch(
            `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(location)}&days=${days}&aqi=no`,
            { next: { revalidate: 1800 } } // Cache for 30 minutes
        );

        if (!response.ok) {
            throw new Error('Weather API request failed');
        }

        const data: WeatherData = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error('Weather API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch weather data' },
            { status: 500 }
        );
    }
}
