import { useState, useRef } from "react";
import { Upload, Camera, Copy, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import jsQR from "jsqr";

const ScanPage = () => {
  const { user } = useAuth();
  const [scannedData, setScannedData] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScannedData("");

    const reader = new FileReader();
    reader.onload = (e) => {
        const image = new Image();
        image.onload = async () => {
            const canvas = canvasRef.current;
            if (!canvas) { setIsScanning(false); return; }
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) { setIsScanning(false); return; }
            ctx.drawImage(image, 0, 0, image.width, image.height);
            const imageData = ctx.getImageData(0, 0, image.width, image.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code && code.data) {
                setScannedData(code.data);
                toast({ title: "สแกนสำเร็จ" });
                if (user) {
                  const { error } = await supabase.from('qrcodes').insert({
                      user_id: user.id,
                      type: 'Scanned Data',
                      data: code.data,
                      preview: code.data.substring(0, 50) + (code.data.length > 50 ? '...' : ''),
                      category: 'scanned'
                  });
                  if (error) {
                    console.error("Supabase insert error on scan:", error);
                    toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถบันทึกประวัติการสแกนได้", variant: "destructive" });
                  }
                }
            } else {
                toast({ title: "ไม่พบ QR Code", variant: "destructive" });
            }
            setIsScanning(false);
        };
        image.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(scannedData);
      setCopied(true);
      toast({ title: "คัดลอกแล้ว", description: "คัดลอกข้อมูลไปยังคลิปบอร์ดแล้ว" });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถคัดลอกข้อมูลได้", variant: "destructive" });
    }
  };

  const openLink = () => {
    if (scannedData.startsWith("http")) {
      window.open(scannedData, "_blank");
    }
  };

  const isUrl = (text: string) => {
    try { new URL(text); return true; } catch { return false; }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div className="text-center mb-8"><h1 className="text-3xl font-bold text-gray-900 mb-2">สแกน QR Code</h1><p className="text-gray-600">อัปโหลดรูปภาพหรือใช้กล้องเพื่อสแกน QR Code</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center space-x-2"><Camera className="h-5 w-5" /><span>เลือกวิธีสแกน</span></CardTitle><CardDescription>อัปโหลดรูปภาพที่มี QR Code เพื่อสแกน</CardDescription></CardHeader>
          <CardContent className="space-y-4"><input type="file" accept="image/*" onChange={handleFileUpload} ref={fileInputRef} className="hidden" /><Button onClick={() => fileInputRef.current?.click()} className="w-full" variant="outline" disabled={isScanning}><Upload className="h-4 w-4 mr-2" />{isScanning ? "กำลังสแกน..." : "อัปโหลดรูปภาพ"}</Button><Button className="w-full" disabled={true} variant="outline"><Camera className="h-4 w-4 mr-2" />ใช้กล้องเว็บแคม (ฟีเจอร์จะเปิดใช้ในเร็วๆ นี้)</Button></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>ผลการสแกน</CardTitle><CardDescription>ข้อมูลที่ตรวจพบจาก QR Code</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            {scannedData ? (<div className="space-y-4"><Textarea value={scannedData} readOnly className="min-h-[120px] font-mono text-sm" placeholder="ยังไม่มีข้อมูลที่สแกน" /><div className="flex space-x-2"><Button onClick={copyToClipboard} variant="outline" className="flex-1">{copied ? <Check className="h-4 w-4 mr-2 text-green-600" /> : <Copy className="h-4 w-4 mr-2" />}{copied ? "คัดลอกแล้ว" : "คัดลอก"}</Button>{isUrl(scannedData) && (<Button onClick={openLink} className="flex-1"><ExternalLink className="h-4 w-4 mr-2" />เปิดลิงก์</Button>)}</div></div>) : (<div className="text-center py-12 text-gray-500"><Camera className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>ยังไม่มีข้อมูลที่สแกน</p><p className="text-sm">อัปโหลดรูปภาพที่มี QR Code เพื่อเริ่มต้น</p></div>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScanPage;