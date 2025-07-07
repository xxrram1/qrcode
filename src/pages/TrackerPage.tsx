import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const TrackerPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [message, setMessage] = useState('กำลังเปลี่ยนเส้นทาง...');

    useEffect(() => {
        const trackAndRedirect = async () => {
            if (!id) {
                setMessage('ไม่พบรหัส QR Code');
                setTimeout(() => navigate('/'), 3000);
                return;
            }

            try {
                supabase.rpc('record_qr_scan', { qr_id: id }).then(({ error }) => {
                    if (error) console.error('Error logging scan:', error);
                });

                const { data, error } = await supabase.from('qrcodes').select('data').eq('id', id).single();
                if (error || !data) {
                    throw new Error('ไม่พบ QR Code หรือไม่สามารถเข้าถึงได้');
                }

                window.location.replace(data.data);
            } catch (error: any) {
                setMessage(`เกิดข้อผิดพลาด: ${error.message}`);
                setTimeout(() => navigate('/'), 3000);
            }
        };

        trackAndRedirect();
    }, [id, navigate]);

    return (
        <div style={{ fontFamily: 'sans-serif', textAlign: 'center', paddingTop: '20vh' }}>
            <h2>QR Master Pro</h2>
            <p>{message}</p>
        </div>
    );
};

export default TrackerPage;