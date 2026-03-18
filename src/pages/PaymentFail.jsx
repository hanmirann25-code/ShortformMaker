import { useNavigate, useSearchParams } from 'react-router-dom';

export default function PaymentFail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const message = searchParams.get('message') || '결제에 실패했어요. 다시 시도해주세요.';

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-2">결제 실패</h2>
      <p className="text-text2 mb-8">{message}</p>
      
      <button 
        onClick={() => navigate('/pricing')}
        className="px-6 py-3 bg-accent text-bg rounded-lg hover:bg-accent2 transition-colors font-medium shadow-md"
      >
        요금제 페이지로 돌아가기
      </button>
    </div>
  );
}
