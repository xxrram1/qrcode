import { useState } from "react";
import { CreditCard, Smartphone, Building2, QrCode, Download, Save, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeCanvas } from "qrcode.react";
import { crc16ccitt } from "@/lib/crc16";

const PaymentPage = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedQR, setGeneratedQR] = useState<string | null>(null);

    const [promptPayData, setPromptPayData] = useState({
        identifier: "",
        amount: "",
    });

    const formatAmount = (amount: string) => {
        if (!amount) return '';
        const num = parseFloat(amount);
        if (isNaN(num)) return '';
        return num.toFixed(2);
    }
    
    const buildPromptPayPayload = (id: string, amount: string) => {
        const F_ID_PAYLOAD_FORMAT = '000201';
        const F_ID_POI_METHOD = '010212';
        const F_ID_MERCHANT_INFO = '2937';
        const F_ID_MERCHANT_INFO_GUID = '0016A000000677010111';
        const F_ID_MERCHANT_INFO_ID_TYPE = id.length === 10 ? '01' : '02';
        const F_ID_MERCHANT_INFO_ID = F_ID_MERCHANT_INFO_ID_TYPE + (id.length === 10 ? '130066' + id.substring(1) : '13' + id);
        const F_ID_COUNTRY_CODE = '5802TH';
        const F_ID_TRANSACTION_CURRENCY = '5303764';
        
        let payload = F_ID_PAYLOAD_FORMAT + F_ID_POI_METHOD + F_ID_MERCHANT_INFO + F_ID_MERCHANT_INFO_GUID + F_ID_MERCHANT_INFO_ID;
        
        if (amount) {
            const formattedAmount = formatAmount(amount);
            const F_ID_TRANSACTION_AMOUNT = '54' + formattedAmount.length.toString().padStart(2, '0') + formattedAmount;
            payload += F_ID_TRANSACTION_AMOUNT;
        }

        payload += F_ID_COUNTRY_CODE + F_ID_TRANSACTION_CURRENCY;
        
        const F_ID_CRC = '6304';
        const crc = crc16ccitt(payload + F_ID_CRC);
        return payload + F_ID_CRC + crc;
    };

    const generatePromptPayQR = async () => {
        if (!promptPayData.identifier) {
            toast({ title: "ข้อผิดพลาด", description: "กรุณากรอกหมายเลข PromptPay", variant: "destructive" });
            return;
        }
        setIsGenerating(true);
        
        const qrData = buildPromptPayPayload(promptPayData.identifier.replace(/-/g, ''), promptPayData.amount);
        setGeneratedQR(qrData);

        if (user) {
            await supabase.from('qrcodes').insert({
                user_id: user.id,
                type: 'PromptPay',
                data: qrData,
                preview: `PromptPay: ${promptPayData.identifier} | ${promptPayData.amount || 'ไม่ระบุ'} THB`,
                category: 'created'
            });
        }
        
        toast({ title: "สร้าง QR Code สำเร็จ" });
        setIsGenerating(false);
    };

    const downloadQR = () => {
        const canvas = document.getElementById("qr-payment-canvas") as HTMLCanvasElement;
        if(canvas) {
            const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
            let downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = "promptpay-qrcode.png";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };
    
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
                    สร้าง QR Code ชำระเงิน
                </h1>
                <p className="text-gray-600">สร้าง QR Code สำหรับรับเงินผ่าน PromptPay</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Smartphone className="h-5 w-5 text-blue-600" />
                            <span>ข้อมูล PromptPay</span>
                        </CardTitle>
                        <CardDescription>
                            กรอกข้อมูลเพื่อสร้าง QR Code สำหรับรับเงิน
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="identifier">หมายเลขโทรศัพท์ หรือ เลขประจำตัวประชาชน</Label>
                            <Input
                                id="identifier"
                                placeholder="0812345678 หรือ 1234567890123"
                                value={promptPayData.identifier}
                                onChange={(e) => setPromptPayData({ ...promptPayData, identifier: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">จำนวนเงิน (บาท) - ไม่บังคับ</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="เช่น 150.50"
                                value={promptPayData.amount}
                                onChange={(e) => setPromptPayData({ ...promptPayData, amount: e.target.value })}
                            />
                        </div>
                        <Button
                            onClick={generatePromptPayQR}
                            disabled={isGenerating}
                            className="w-full bg-gradient-to-r from-blue-600 to-green-600"
                        >
                            {isGenerating ? "กำลังสร้าง..." : "สร้าง QR Code"}
                        </Button>
                    </CardContent>
                </Card>

                {generatedQR && (
                    <Card>
                        <CardHeader>
                            <CardTitle>QR Code ที่สร้าง</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-center">
                            <div className="bg-white p-4 rounded-lg inline-block border-2 border-dashed">
                               <QRCodeCanvas id="qr-payment-canvas" value={generatedQR} size={256} />
                            </div>
                            <div className="flex space-x-2">
                                <Button variant="outline" onClick={downloadQR} className="flex-1">
                                    <Download className="h-4 w-4 mr-2" />
                                    ดาวน์โหลด
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
             <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                <CardHeader>
                    <CardTitle className="text-amber-800">💡 คำแนะนำ</CardTitle>
                </CardHeader>
                <CardContent className="text-amber-700">
                    <ul className="space-y-2 text-sm list-disc pl-5">
                        <li>กรอกหมายเลขโทรศัพท์ 10 หลัก หรือ เลขประจำตัวประชาชน 13 หลัก</li>
                        <li>หากไม่ระบุจำนวนเงิน ผู้สแกนจะสามารถกรอกจำนวนเงินเองได้</li>
                        <li>ทดสอบสแกน QR Code ด้วยแอปพลิเคชันของธนาคารก่อนนำไปใช้งานจริง</li>
                        <li className="font-medium">เมื่อเข้าสู่ระบบ QR Code ที่สร้างจะถูกบันทึกในหน้าประวัติโดยอัตโนมัติ</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentPage;