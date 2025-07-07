import { useState } from "react";
import { QrCode, Link as LinkIcon, MessageSquare, Wifi, User, Download } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";

const CreatePage = () => {
    const { user } = useAuth();
    const [qrData, setQrData] = useState("");
    const [activeTab, setActiveTab] = useState("url");
    const { toast } = useToast();
    const [enableTracking, setEnableTracking] = useState(false);

    // State เดิมทั้งหมดของคุณ
    const [urlData, setUrlData] = useState("");
    const [textData, setTextData] = useState("");
    const [contactData, setContactData] = useState({ name: "", phone: "", email: "", organization: "" });
    const [wifiData, setWifiData] = useState({ ssid: "", password: "", security: "WPA" });

    const generateQR = async () => {
        let dataToEncode = "";
        let originalData = "";
        let type = "URL";
        let preview = "";

        switch (activeTab) {
            case "url":
                type = enableTracking && user ? 'Tracked URL' : 'URL';
                originalData = urlData;
                preview = urlData;
                break;
            case "text":
                type = 'Text';
                originalData = textData;
                preview = textData.substring(0, 50) + (textData.length > 50 ? '...' : '');
                break;
            case "contact":
                type = 'Contact';
                originalData = `BEGIN:VCARD\nVERSION:3.0\nFN:${contactData.name}\nTEL:${contactData.phone}\nEMAIL:${contactData.email}\nORG:${contactData.organization}\nEND:VCARD`;
                preview = `Contact: ${contactData.name}`;
                break;
            case "wifi":
                type = 'WiFi';
                originalData = `WIFI:T:${wifiData.security};S:${wifiData.ssid};P:${wifiData.password};;`;
                preview = `WiFi: ${wifiData.ssid}`;
                break;
        }

        if (!originalData.trim() || (activeTab === "contact" && !contactData.name.trim())) {
            toast({ title: "ข้อมูลไม่ครบถ้วน", description: "กรุณากรอกข้อมูลที่จำเป็น", variant: "destructive" });
            return;
        }
        
        const isTrackingEnabled = enableTracking && activeTab === 'url' && user;

        if (user) {
            const { data: newQr, error } = await supabase.from('qrcodes').insert({
                user_id: user.id,
                type: isTrackingEnabled ? 'Tracked URL' : type,
                data: originalData,
                preview: preview,
                category: 'created'
            }).select().single();

            if (error) {
                console.error("Supabase insert error:", error);
                toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถบันทึก QR Code ได้ โปรดตรวจสอบ Policy", variant: "destructive" });
                return;
            }
            
            dataToEncode = isTrackingEnabled ? `${window.location.origin}/track/${newQr.id}` : originalData;
        } else {
            dataToEncode = originalData;
        }
        
        setQrData(dataToEncode);
        toast({ title: "สร้าง QR Code สำเร็จ" });
    };
    
    const downloadQR = () => {
        const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement;
        if (canvas) {
          const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
          let downloadLink = document.createElement("a");
          downloadLink.href = pngUrl;
          downloadLink.download = "qrcode.png";
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          toast({ title: "ดาวน์โหลดสำเร็จ" });
        } else {
            toast({ title: "เกิดข้อผิดพลาด", description: "ไม่พบภาพ QR Code ที่จะดาวน์โหลด", variant: "destructive" });
        }
    };

  const qrTypes = [
    { id: "url", name: "เว็บไซต์ / URL", icon: LinkIcon },
    { id: "text", name: "ข้อความ", icon: MessageSquare },
    { id: "contact", name: "ข้อมูลติดต่อ", icon: User },
    { id: "wifi", name: "Wi-Fi", icon: Wifi },
  ];

return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="text-center mb-8"><h1 className="text-3xl font-bold text-gray-900 mb-2">สร้าง QR Code</h1><p className="text-gray-600">เลือกประเภทข้อมูลที่ต้องการสร้าง QR Code</p></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader><CardTitle>เลือกประเภท QR Code</CardTitle><CardDescription>กรอกข้อมูลตามประเภทที่เลือก</CardDescription></CardHeader>
                        <CardContent>
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full">
                                    <TabsTrigger value="url" className="flex items-center space-x-1"><LinkIcon className="h-4 w-4" /><span>เว็บไซต์ / URL</span></TabsTrigger>
                                    <TabsTrigger value="text" className="flex items-center space-x-1"><MessageSquare className="h-4 w-4" /><span>ข้อความ</span></TabsTrigger>
                                    <TabsTrigger value="contact" className="flex items-center space-x-1"><User className="h-4 w-4" /><span>ข้อมูลติดต่อ</span></TabsTrigger>
                                    <TabsTrigger value="wifi" className="flex items-center space-x-1"><Wifi className="h-4 w-4" /><span>Wi-Fi</span></TabsTrigger>
                                </TabsList>
                                <TabsContent value="url" className="space-y-4 mt-6">
                                    <div><Label htmlFor="url">URL เว็บไซต์</Label><Input id="url" placeholder="https://example.com" value={urlData} onChange={(e) => setUrlData(e.target.value)} /></div>
                                    {user && (<div className="flex items-center space-x-2 pt-2"><Switch id="tracking-switch" checked={enableTracking} onCheckedChange={setEnableTracking} /><Label htmlFor="tracking-switch">เปิดใช้งานการติดตามสถิติ</Label></div>)}
                                </TabsContent>
                                <TabsContent value="text" className="space-y-4 mt-6"><div><Label htmlFor="text">ข้อความ</Label><Textarea id="text" placeholder="กรอกข้อความที่ต้องการ..." value={textData} onChange={(e) => setTextData(e.target.value)} rows={4} /></div></TabsContent>
                                <TabsContent value="contact" className="space-y-4 mt-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><Label htmlFor="name">ชื่อ-นามสกุล</Label><Input id="name" placeholder="นาย สมชาย ใจดี" value={contactData.name} onChange={(e) => setContactData({ ...contactData, name: e.target.value })} /></div><div><Label htmlFor="phone">เบอร์โทรศัพท์</Label><Input id="phone" placeholder="081-234-5678" value={contactData.phone} onChange={(e) => setContactData({ ...contactData, phone: e.target.value })} /></div><div><Label htmlFor="email">อีเมล</Label><Input id="email" placeholder="example@email.com" type="email" value={contactData.email} onChange={(e) => setContactData({ ...contactData, email: e.target.value })} /></div><div><Label htmlFor="organization">บริษัท/องค์กร</Label><Input id="organization" placeholder="บริษัท ABC จำกัด" value={contactData.organization} onChange={(e) => setContactData({ ...contactData, organization: e.target.value })} /></div></div></TabsContent>
                                <TabsContent value="wifi" className="space-y-4 mt-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><Label htmlFor="ssid">ชื่อ Wi-Fi (SSID)</Label><Input id="ssid" placeholder="My WiFi Network" value={wifiData.ssid} onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })} /></div><div><Label htmlFor="password">รหัสผ่าน</Label><Input id="password" type="password" placeholder="รหัสผ่าน Wi-Fi" value={wifiData.password} onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })} /></div></div></TabsContent>
                            </Tabs>
                            <div className="mt-6"><Button onClick={generateQR} className="w-full" size="lg"><QrCode className="h-4 w-4 mr-2" />สร้าง QR Code</Button></div>
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <Card>
                        <CardHeader><CardTitle>ตัวอย่าง QR Code</CardTitle><CardDescription>QR Code ที่สร้างขึ้นจะแสดงที่นี่</CardDescription></CardHeader>
                        <CardContent className="flex justify-center items-center h-full min-h-[280px]">
                            {qrData ? (<div className="space-y-4 text-center"><QRCodeCanvas id="qr-code-canvas" value={qrData} size={192} /><div className="text-xs text-gray-600 p-3 bg-gray-50 rounded-lg"><strong>ข้อมูลใน QR Code:</strong><p className="mt-1 break-all">{qrData.substring(0, 100)}...</p></div><Button onClick={downloadQR} className="w-full" variant="outline"><Download className="h-4 w-4 mr-2" />ดาวน์โหลด</Button></div>) : (<div className="text-center py-12 text-gray-500"><QrCode className="h-16 w-16 mx-auto mb-4 opacity-50" /><p>กรอกข้อมูลเพื่อสร้าง</p><p className="text-sm">เพื่อดู QR Code</p></div>)}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
export default CreatePage;