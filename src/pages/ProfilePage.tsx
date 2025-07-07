import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

const ProfilePage = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState('');

    useEffect(() => {
        if (user) {
            setFullName(user.user_metadata?.full_name || '');
        }
    }, [user]);

    const getInitials = (name: string) => {
        return name ? name.split(' ').map((n) => n[0]).join('').toUpperCase() : 'U';
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.updateUser({
            data: { full_name: fullName }
        });

        if (error) {
            toast({ title: "เกิดข้อผิดพลาด", description: error.message, variant: "destructive" });
        } else {
            await supabase.auth.refreshSession();
            toast({ title: "อัปเดตข้อมูลสำเร็จ", description: "ข้อมูลส่วนตัวของคุณถูกบันทึกแล้ว" });
        }
        setLoading(false);
    };

    if (!user) {
        return <div>กำลังโหลด...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-center">ข้อมูลส่วนตัว</h1>
            <Card>
                <CardHeader>
                    <CardTitle>แก้ไขโปรไฟล์</CardTitle>
                    <CardDescription>จัดการข้อมูลส่วนตัวและชื่อที่แสดงผลของคุณ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={user.user_metadata?.avatar_url || undefined} alt="Profile" />
                            <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-600 to-green-600 text-white">
                                {getInitials(fullName)}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">อีเมล</Label>
                            <Input id="email" type="email" value={user.email || ''} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fullName">ชื่อ-นามสกุล</Label>
                            <Input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="ชื่อ-นามสกุลของคุณ"
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProfilePage;