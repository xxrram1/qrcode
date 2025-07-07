import { QrCode, Scan, CreditCard, History, Zap, Shield, Smartphone, Sparkles, LogIn, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const quickActions = [
    {
      title: "สแกน QR Code",
      description: "สแกนและถอดรหัส QR Code ทุกประเภท",
      icon: Scan,
      path: "/scan",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "สร้าง QR Code",
      description: "สร้าง QR Code สำหรับข้อความ, URL, และอื่นๆ",
      icon: QrCode,
      path: "/create",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "QR Code ชำระเงิน",
      description: "สร้าง QR Code สำหรับ PromptPay และการโอนเงิน",
      icon: CreditCard,
      path: "/payment",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "ประวัติการใช้งาน",
      description: "ดูประวัติ QR Code ที่สแกนและสร้าง (ต้องล็อกอิน)",
      icon: History,
      path: "/history",
      color: "bg-orange-500 hover:bg-orange-600",
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "รวดเร็วและแม่นยำ",
      description: "สแกนและสร้าง QR Code ได้อย่างรวดเร็วด้วยเทคโนโลยีล่าสุด",
    },
    {
      icon: Shield,
      title: "ปลอดภัยและเชื่อถือได้",
      description: "ข้อมูลของคุณจะถูกป้องกันด้วยมาตรฐานความปลอดภัยสูงสุด",
    },
    {
      icon: Smartphone,
      title: "ใช้งานได้ทุกอุปกรณ์",
      description: "รองรับการใช้งานบนคอมพิวเตอร์ แท็บเล็ต และสมาร์ทโฟน",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-2xl p-8 md:p-12">
        <QrCode className="h-16 w-16 mx-auto mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          สร้างสรรค์ QR Code ของคุณ: สแกน, สร้าง, จ่าย!
        </h1>
        <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto mb-6">
          เครื่องมือจัดการ QR Code ที่ครบวงจร ใช้งานฟรีทันทีโดยไม่ต้องล็อกอิน
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            <Link to="/scan">
              <Scan className="h-5 w-5 mr-2" />
              เริ่มสแกน QR Code
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
            <Link to="/create">
              <QrCode className="h-5 w-5 mr-2" />
              สร้าง QR Code แรก
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action) => (
          <Link key={action.path} to={action.path}>
            <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer border-0 shadow-md hover:scale-105">
              <CardHeader className="text-center pb-2">
                <div className={`w-16 h-16 ${action.color} text-white rounded-full flex items-center justify-center mx-auto mb-4 transition-colors`}>
                  <action.icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-sm">
                  {action.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Features Section */}
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          ทำไมต้องเลือกเรา?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Authentication Prompt for Advanced Features */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 border border-blue-200 rounded-xl p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl flex items-center justify-center mx-auto">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">ปลดล็อกฟีเจอร์ขั้นสูง</h3>
          <p className="text-gray-600">ล็อกอินเพื่อเข้าถึงฟีเจอร์พิเศษและบันทึกผลงานของคุณ</p>
          
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 text-sm mb-3">ฟีเจอร์พิเศษที่คุณจะได้รับ:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-600 to-green-600 rounded-full"></div>
                <span>บันทึก QR Code บนคลาวด์</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-600 to-green-600 rounded-full"></div>
                <span>ติดตามสถิติการสแกน</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-600 to-green-600 rounded-full"></div>
                <span>จัดระเบียบด้วยโฟลเดอร์</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-600 to-green-600 rounded-full"></div>
                <span>แก้ไข QR Code ที่สร้างแล้ว</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-gradient-to-r from-blue-600 to-green-600">
              <Link to="/auth">
                <LogIn className="h-4 w-4 mr-2" />
                เข้าสู่ระบบ
              </Link>
            </Button>
            <Button asChild variant="outline" className="bg-white">
              <Link to="/auth">
                <UserPlus className="h-4 w-4 mr-2" />
                สมัครสมาชิก
              </Link>
            </Button>
          </div>

          <p className="text-xs text-gray-500">
            * คุณสามารถใช้งานฟีเจอร์พื้นฐานได้โดยไม่ต้องล็อกอิน
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
