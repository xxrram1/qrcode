import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // onAuthStateChange จะทำงานทุกครั้งที่สถานะการล็อกอินเปลี่ยน (รวมถึงการ refresh token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // ตรวจสอบ session เมื่อเปิดแอปครั้งแรก
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName || '' } }
    });
    if (error) {
      toast({ title: "สมัครสมาชิกล้มเหลว", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "สมัครสมาชิกสำเร็จ", description: "คุณสามารถเข้าสู่ระบบได้เลย" });
    }
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
     if (error) {
        toast({ title: "เข้าสู่ระบบล้มเหลว", description: "อีเมลหรือรหัสผ่านไม่ถูกต้อง", variant: "destructive" });
    } else {
        toast({ title: "เข้าสู่ระบบสำเร็จ", description: "ยินดีต้อนรับกลับมา! 🎉" });
    }
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "ออกจากระบบสำเร็จ" });
  };

  const resetPassword = async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
       if (error) {
        toast({ title: "เกิดข้อผิดพลาด", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "ส่งอีเมลแล้ว", description: "กรุณาตรวจสอบอีเมลเพื่อรีเซ็ตรหัสผ่าน" });
      }
      return { error };
  }

  const value = { user, session, loading, signUp, signIn, signOut, resetPassword };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};