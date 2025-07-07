import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parse } from 'date-fns';
import { th } from 'date-fns/locale';

const processScanData = (scans: { created_at: string }[]) => {
    if (!scans || scans.length === 0) return [];
    
    const scansByDay = scans.reduce((acc: { [key: string]: number }, scan) => {
        const day = format(new Date(scan.created_at), 'd MMM yy', { locale: th });
        acc[day] = (acc[day] || 0) + 1;
        return acc;
    }, {});

    const sortedDays = Object.keys(scansByDay).sort((a, b) => {
        const dateA = parse(a, 'd MMM yy', new Date(), { locale: th });
        const dateB = parse(b, 'd MMM yy', new Date(), { locale: th });
        return dateA.getTime() - dateB.getTime();
    });

    return sortedDays.map(day => ({ date: day, scans: scansByDay[day] }));
};

const StatisticsPage = () => {
    const { id } = useParams<{ id: string }>();
    const [chartData, setChartData] = useState<{ date: string; scans: number }[]>([]);

    const { data: qrCodeInfo } = useQuery({
        queryKey: ['qrCodeInfo', id],
        queryFn: async () => {
            if (!id) return null;
            const { data, error } = await supabase.from('qrcodes').select('preview').eq('id', id).single();
            if (error) throw new Error(error.message);
            return data;
        },
        enabled: !!id,
    });
    
    useEffect(() => {
        if (!id) return;

        const fetchInitialData = async () => {
            const { data, error } = await supabase.from('qrcode_scans').select('created_at').eq('qrcode_id', id);
            if (error) { console.error("Error fetching initial data:", error); return; }
            if (data) { setChartData(processScanData(data)); }
        };
        fetchInitialData();

        const channel = supabase.channel(`public:qrcode_scans:qrcode_id=eq.${id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'qrcode_scans', filter: `qrcode_id=eq.${id}` },
                (payload) => {
                    const newScan = payload.new as { created_at: string };
                    setChartData(currentData => {
                        const dayKey = format(new Date(newScan.created_at), 'd MMM yy', { locale: th });
                        const existingDayIndex = currentData.findIndex(d => d.date === dayKey);

                        if (existingDayIndex > -1) {
                            const updatedData = [...currentData];
                            updatedData[existingDayIndex].scans += 1;
                            return updatedData;
                        } else {
                            const newData = [...currentData, { date: dayKey, scans: 1 }];
                            return newData.sort((a,b) => parse(a.date, 'd MMM yy', new Date(), { locale: th }).getTime() - parse(b.date, 'd MMM yy', new Date(), { locale: th }).getTime());
                        }
                    });
                }
            ).subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [id]);
    
    const totalScans = chartData.reduce((sum, item) => sum + item.scans, 0);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-4">
                <h1 className="text-3xl font-bold">สถิติการสแกน</h1>
                <p className="text-gray-600 truncate">{qrCodeInfo?.preview || 'กำลังโหลด...'}</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>กราฟสแกนรายวัน</CardTitle>
                    <CardDescription>ยอดรวมทั้งหมด: <strong>{totalScans} ครั้ง</strong> (ข้อมูลอัปเดตอัตโนมัติ)</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="scans" fill="#8884d8" name="จำนวนครั้ง" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};

export default StatisticsPage;