// src/pages/SettingsPage.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const SettingsPage = () => {
    const { signOut } = useAuth();

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-center">การตั้งค่า</h1>
            <Card>
                <CardHeader>
                    <CardTitle>บัญชี</CardTitle>
                    <CardDescription>จัดการการตั้งค่าบัญชีของคุณ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                            <h3 className="font-medium">ออกจากระบบ</h3>
                            <p className="text-sm text-muted-foreground">ออกจากระบบบัญชีปัจจุบันของคุณ</p>
                        </div>
                        <Button variant="destructive" onClick={signOut}>
                            ออกจากระบบ
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SettingsPage;