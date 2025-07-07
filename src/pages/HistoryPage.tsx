import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { History, QrCode, Scan, Search, Filter, Download, Trash2, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";

const HistoryPage = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    
    // --- State และ Ref สำหรับฟังก์ชันดาวน์โหลด ---
    const [dataToDownload, setDataToDownload] = useState<{data: string, name: string} | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    // --- Effect สำหรับจัดการการดาวน์โหลด ---
    useEffect(() => {
        if (dataToDownload && canvasRef.current) {
            const canvas = canvasRef.current.querySelector('canvas');
            if (canvas) {
                const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
                let downloadLink = document.createElement("a");
                downloadLink.href = pngUrl;
                downloadLink.download = `${dataToDownload.name}.png`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                toast({ title: "ดาวน์โหลดสำเร็จ" });
            }
            setDataToDownload(null); // รีเซ็ตค่าหลังจากดาวน์โหลด
        }
    }, [dataToDownload, toast]);

    const handleDownload = (item: any) => {
        const dataForQR = item.type === 'Tracked URL' 
            ? `${window.location.origin}/track/${item.id}` 
            : item.data;
        
        const safeName = item.preview.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'qrcode';
        setDataToDownload({ data: dataForQR, name: safeName });
    };

    // --- ฟังก์ชันสำหรับดึงข้อมูลประวัติ ---
    const fetchHistory = async (category: 'scanned' | 'created') => {
        if (!user) return [];
        let query = supabase.from('qrcodes').select('*').eq('user_id', user.id).eq('category', category);
        if (searchTerm.trim()) {
            query = query.ilike('preview', `%${searchTerm.trim()}%`);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        return data;
    };

    const { data: scannedHistory = [] } = useQuery({ queryKey: ['scannedHistory', user?.id, searchTerm], queryFn: () => fetchHistory('scanned'), enabled: !!user });
    const { data: createdHistory = [] } = useQuery({ queryKey: ['createdHistory', user?.id, searchTerm], queryFn: () => fetchHistory('created'), enabled: !!user });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => supabase.from('qrcodes').delete().eq('id', id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['scannedHistory'] });
            queryClient.invalidateQueries({ queryKey: ['createdHistory'] });
            toast({title: "ลบข้อมูลสำเร็จ"});
        },
        onError: (error) => {
            toast({title: "เกิดข้อผิดพลาดในการลบ", description: error.message, variant: "destructive"});
        }
    });
    
    // --- ฟังก์ชันคำนวณสถิติ ---
    const todayScans = useMemo(() => scannedHistory.filter(item => new Date(item.created_at).toDateString() === new Date().toDateString()).length, [scannedHistory]);
    const todayCreates = useMemo(() => createdHistory.filter(item => new Date(item.created_at).toDateString() === new Date().toDateString()).length, [createdHistory]);

    const getTypeColor = (type: string) => {
        switch (type) {
            case "URL": return "bg-blue-100 text-blue-800";
            case "Tracked URL": return "bg-teal-100 text-teal-800";
            case "Text": return "bg-green-100 text-green-800";
            case "Contact": return "bg-purple-100 text-purple-800";
            case "WiFi": return "bg-orange-100 text-orange-800";
            case "PromptPay": return "bg-pink-100 text-pink-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const HistoryItem = ({ item, showDownload = false }: { item: any, showDownload?: boolean }) => (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1 overflow-hidden pr-2">
                        <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getTypeColor(item.type)}>{item.type}</Badge>
                            <span className="text-sm text-gray-500">{new Date(item.created_at).toLocaleString('th-TH')}</span>
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1 truncate" title={item.preview}>{item.preview}</h3>
                        <p className="text-sm text-gray-600 truncate max-w-md">{item.data}</p>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                        {item.type === 'Tracked URL' && (
                            <Button asChild size="sm" variant="outline" title="ดูสถิติ"><Link to={`/history/${item.id}/stats`}><BarChart2 className="h-4 w-4" /></Link></Button>
                        )}
                        {showDownload && (
                            <Button size="sm" variant="outline" title="ดาวน์โหลด" onClick={() => handleDownload(item)}>
                                <Download className="h-4 w-4" />
                            </Button>
                        )}
                        <AlertDialog>
                            <AlertDialogTrigger asChild><Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" title="ลบ"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>ยืนยันการลบ?</AlertDialogTitle></AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteMutation.mutate(item.id)}>ลบ</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Canvas ที่ซ่อนไว้สำหรับสร้างไฟล์ดาวน์โหลด */}
      <div ref={canvasRef} style={{ position: 'fixed', top: '-9999px', left: '-9999px' }}>
        {dataToDownload && <QRCodeCanvas value={dataToDownload.data} size={512} />}
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ประวัติการใช้งาน</h1>
        <p className="text-gray-600">ดูประวัติ QR Code ที่สแกนและสร้างทั้งหมด</p>
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="ค้นหาข้อมูลใน QR Code..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
            <Button variant="outline" disabled><Filter className="h-4 w-4 mr-2" />กรองข้อมูล</Button>
          </div>
        </CardContent>
      </Card>
      <Tabs defaultValue="created" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scanned" className="flex items-center space-x-2"><Scan className="h-4 w-4" /><span>QR Code ที่สแกน</span></TabsTrigger>
          <TabsTrigger value="created" className="flex items-center space-x-2"><QrCode className="h-4 w-4" /><span>QR Code ที่สร้าง</span></TabsTrigger>
        </TabsList>
        <TabsContent value="scanned" className="mt-6">
          <div className="space-y-4">
            {scannedHistory.length > 0 ? scannedHistory.map((item) => <HistoryItem key={item.id} item={item} />) : <Card><CardContent className="text-center py-12"><Scan className="h-16 w-16 mx-auto mb-4 text-gray-400" /><h3 className="text-lg font-medium">ยังไม่มีประวัติการสแกน</h3><p className="text-gray-600 mb-4">เริ่มสแกน QR Code เพื่อดูประวัติที่นี่</p><Button asChild><Link to="/scan">เริ่มสแกน</Link></Button></CardContent></Card>}
          </div>
        </TabsContent>
        <TabsContent value="created" className="mt-6">
          <div className="space-y-4">
            {createdHistory.length > 0 ? createdHistory.map((item) => <HistoryItem key={item.id} item={item} showDownload={true} />) : <Card><CardContent className="text-center py-12"><QrCode className="h-16 w-16 mx-auto mb-4 text-gray-400" /><h3 className="text-lg font-medium">ยังไม่มีประวัติการสร้าง</h3><p className="text-gray-600 mb-4">เริ่มสร้าง QR Code เพื่อดูประวัติที่นี่</p><Button asChild><Link to="/create">สร้าง QR Code</Link></Button></CardContent></Card>}
          </div>
        </TabsContent>
      </Tabs>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-lg">QR Code ที่สแกน</CardTitle><CardDescription>ทั้งหมด</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{scannedHistory.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-lg">QR Code ที่สร้าง</CardTitle><CardDescription>ทั้งหมด</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{createdHistory.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-lg">การใช้งานวันนี้</CardTitle><CardDescription>รวมทั้งหมด</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold text-purple-600">{todayScans + todayCreates}</div></CardContent></Card>
      </div>
    </div>
  );
};
export default HistoryPage;