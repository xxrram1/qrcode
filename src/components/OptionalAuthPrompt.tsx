
import { LogIn, UserPlus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface OptionalAuthPromptProps {
  title?: string;
  description?: string;
  features?: string[];
  variant?: "default" | "compact" | "sidebar";
}

const OptionalAuthPrompt = ({ 
  title = "ปลดล็อกฟีเจอร์ขั้นสูง",
  description = "ล็อกอินเพื่อเข้าถึงฟีเจอร์พิเศษและบันทึกผลงานของคุณ",
  features = [
    "บันทึก QR Code บนคลาวด์",
    "ติดตามสถิติการสแกน",
    "จัดระเบียบด้วยโฟลเดอร์",
    "แก้ไข QR Code ที่สร้างแล้ว"
  ],
  variant = "default"
}: OptionalAuthPromptProps) => {
  const navigate = useNavigate();

  if (variant === "compact") {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          <Button 
            variant="outline" 
            className="bg-white hover:bg-gray-50"
            onClick={() => navigate('/auth')}
          >
            ล็อกอิน
          </Button>
        </div>
      </div>
    );
  }

  if (variant === "sidebar") {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-green-50 border-blue-200">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-gray-900">{title}</h3>
          </div>
          <p className="text-sm text-gray-600">{description}</p>
          <div className="space-y-2">
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-green-600"
              onClick={() => navigate('/auth')}
            >
              <LogIn className="h-4 w-4 mr-2" />
              เข้าสู่ระบบ
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/auth')}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              สมัครสมาชิก
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 via-white to-green-50 border-blue-200 shadow-lg">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl flex items-center justify-center mx-auto">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
          </div>

          <div className="bg-white rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-gray-900 text-sm">ฟีเจอร์พิเศษที่คุณจะได้รับ:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-600 to-green-600 rounded-full"></div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex space-x-3">
            <Button 
              className="flex-1 bg-gradient-to-r from-blue-600 to-green-600"
              onClick={() => navigate('/auth')}
            >
              <LogIn className="h-4 w-4 mr-2" />
              เข้าสู่ระบบ
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 bg-white"
              onClick={() => navigate('/auth')}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              สมัครสมาชิก
            </Button>
          </div>

          <p className="text-xs text-gray-500">
            * คุณสามารถใช้งานฟีเจอร์พื้นฐานได้โดยไม่ต้องล็อกอิน
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OptionalAuthPrompt;
