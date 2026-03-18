import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        const paymentKey = searchParams.get('paymentKey');
        const orderId = searchParams.get('orderId');
        const amount = searchParams.get('amount');
        const planType = searchParams.get('plan'); 
        
        if (!paymentKey || !orderId || !amount) {
          throw new Error("결제 정보가 올바르지 않습니다.");
        }

        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) throw new Error("로그인되어 있지 않습니다.");

        const { error: updateError } = await supabase
          .from('users')
          .update({ plan: planType || 'standard' })
          .eq('id', user.id);
          
        if (updateError) throw updateError;
        
        setTimeout(() => {
          navigate('/generate');
        }, 3000);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };

    processPayment();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-2xl font-bold mb-4 text-red-500">결제 처리에 실패했습니다</h2>
        <p className="text-text2 mb-8">{error}</p>
        <button 
          onClick={() => navigate('/pricing')}
          className="px-6 py-2 bg-bg3 border border-border rounded-lg hover:bg-bg2 transition-colors"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 bg-accent/20 text-accent rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-2">결제가 완료됐어요!</h2>
      <p className="text-text2 mb-8">이제 무제한으로 사용하세요.</p>
      <p className="text-sm text-text3">잠시 후 대본 생성 페이지로 이동합니다...</p>
    </div>
  );
}
