"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Download, Search, Calendar as CalendarIcon } from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SensorData {
  id: number;
  temperature: number;
  humidity: number;
  moisture: number;
  motor_state: boolean;
  inserted_at: string;
}

export default function LogPage() {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [date, setDate] = useState<Date>();
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFrame, setTimeFrame] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch sensor data from Supabase
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        setLoading(true);
        let query = supabase.from('sensordata').select('*').order('inserted_at', { ascending: false });

        // Apply date filter if a date is selected
        if (date) {
          const formattedDate = format(date, 'yyyy-MM-dd');
          query = query.gte('inserted_at', `${formattedDate}T00:00:00Z`)
                       .lt('inserted_at', `${formattedDate}T23:59:59Z`);
        }

        // Apply time frame filter
        const now = new Date();
        switch (timeFrame) {
          case 'today':
            query = query.gte('inserted_at', now.toISOString().split('T')[0] + 'T00:00:00Z');
            break;
          case 'week':
            const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
            query = query.gte('inserted_at', weekAgo.toISOString());
            break;
          case 'month':
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            query = query.gte('inserted_at', monthAgo.toISOString());
            break;
        }

        const { data, error } = await query;

        if (error) throw error;

        setSensorData(data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching sensor data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchSensorData();
  }, [date, timeFrame]);

  // Filter data based on search term
  const filteredData = sensorData.filter(data => 
    Object.values(data).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Download CSV functionality
  const downloadCSV = () => {
    const csvContent = [
      'ID,Temperature,Humidity,Moisture,Motor State,Timestamp',
      ...filteredData.map(data => 
        `${data.id},${data.temperature},${data.humidity},${data.moisture},${data.motor_state},${data.inserted_at}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sensor_data_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  // Render loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p>Loading sensor data...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="container mx-auto p-6 text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Sensor Data Logs</h1>
        <Button onClick={downloadCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex items-center justify-between p-4">
              <Input
                type="date"
                value={date ? format(date, 'yyyy-MM-dd') : ''}
                onChange={(e) => setDate(new Date(e.target.value))}
                className="w-full"
              />
              <Button variant="outline" onClick={() => setDate(undefined)}>
                Clear
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Select value={timeFrame} onValueChange={setTimeFrame}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time frame" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This week</SelectItem>
            <SelectItem value="month">This month</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search logs..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Temperature</TableHead>
              <TableHead>Humidity</TableHead>
              <TableHead>Moisture</TableHead>
              <TableHead>Motor State</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((data) => (
              <TableRow key={data.id}>
                <TableCell>{new Date(data.inserted_at).toLocaleString()}</TableCell>
                <TableCell>{data.temperature.toFixed(1)}°C</TableCell>
                <TableCell>{data.humidity.toFixed(1)}%</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ width: `${data.moisture}%` }}
                      />
                    </div>
                    {data.moisture.toFixed(1)}%
                  </div>
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    data.motor_state 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  )}>
                    {data.motor_state ? 'ON' : 'OFF'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No sensor data found
          </div>
        )}
      </div>
    </div>
  );
}