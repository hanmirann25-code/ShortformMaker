import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { supabase } from '../lib/supabase';

const CheckIcon = ({ className = "", strokeWidth = 2 }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = ({ className = "", strokeWidth = 2 }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronDownIcon = ({ className = "", expanded, strokeWidth = 2 }) => (
  <svg 
    className={`w-5 h-5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''} ${className}`} 
    fill="none" viewBox="0 0 24 24" stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M19 9l-7 7-7-7" />
  </svg>
);

export default function Pricing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handlePayment = async (planType, price, planName) => {
    if (!user) {
      navigate(`/auth?plan=${planType}`);
      return;
    }

    const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY;
    if (!clientKey) {
      alert("토스페이먼츠 연동 키가 설정되지 않았습니다.");
      return;
    }

    try {
      const tossPayments = await loadTossPayments(clientKey);
      await tossPayments.requestPayment("카드", {
        amount: price,
        orderId: `order_${new Date().getTime()}_${user?.id?.substring(0, 8) || 'idx'}`,
        orderName: planName,
        customerName: user.email?.split('@')[0] || "고객",
        successUrl: `${window.location.origin}/payment/success?plan=${planType}`,
        failUrl: `${window.location.origin}/payment/fail`
      });
    } catch (error) {
      console.error(error);
      if (error.code !== "USER_CANCEL") {
        alert("결제 창 호출에 실패했습니다: " + error.message);
      }
    }
  };

  const toggleFaq = (idx) => {
    if (openFaq === idx) {
      setOpenFaq(null);
    } else {
      setOpenFaq(idx);
    }
  };

  const faqs = [
    {
      q: "무료 플랜은 언제까지 사용할 수 있나요?",
      a: "기한 제한 없이 매월 5회 무료 대본 생성이 가능합니다. 매월 1일에 횟수가 초기화됩니다."
    },
    {
      q: "결제는 어떻게 하나요?",
      a: "신용카드, 카카오페이, 네이버페이 등 다양한 결제 수단을 지원하고 있습니다."
    },
    {
      q: "구독을 취소하면 어떻게 되나요?",
      a: "구독을 취소해도 다음 결제일 전까지는 현재 플랜의 혜택을 그대로 이용할 수 있습니다."
    },
    {
      q: "환불이 되나요?",
      a: "결제 후 7일 이내, 서비스를 이용하지 않으셨다면 전액 환불이 가능합니다."
    }
  ];

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">요금제</h1>
        <p className="text-text2">간편하게 쇼츠 대본을 만들고 채널을 성장시키세요.</p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
        {/* Free Plan */}
        <div className="bg-card rounded-2xl p-8 border border-border flex flex-col transition-transform hover:-translate-y-1 hover:shadow-lg">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-2">무료 플랜</h3>
            <div className="text-4xl font-bold mb-2">0원<span className="text-lg text-text2 font-normal"> / 월</span></div>
            <p className="text-text2">가볍게 시작해보세요</p>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3">
              <CheckIcon className="text-accent" />
              <span>월 5회 대본 생성</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckIcon className="text-accent" />
              <span>기본 말투 3종</span>
            </li>
            <li className="flex items-center gap-3 text-text3 opacity-60">
              <XIcon />
              <span>히스토리 저장 불가</span>
            </li>
            <li className="flex items-center gap-3 text-text3 opacity-60">
              <XIcon />
              <span>썸네일 문구 미제공</span>
            </li>
          </ul>
          <Link 
            to="/generate" 
            className="w-full inline-block text-center py-4 rounded-xl bg-border hover:bg-border2 transition-colors font-medium text-text1"
          >
            무료로 시작
          </Link>
        </div>

        {/* Standard Plan */}
        <div className="bg-card rounded-2xl p-8 border-2 border-accent relative flex flex-col transform lg:-translate-y-4 shadow-xl shadow-accent/10 hover:-translate-y-5 hover:shadow-2xl hover:shadow-accent/20 transition-all">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent text-bg px-5 py-1.5 rounded-full text-sm font-bold shadow-md">
            추천 플랜
          </div>
          <div className="mb-8 mt-2">
            <h3 className="text-2xl font-bold mb-2">스탠다드 플랜</h3>
            <div className="text-4xl font-bold mb-2">9,900원<span className="text-lg text-text2 font-normal"> / 월</span></div>
            <p className="text-text2">본격적인 크리에이터를 위해</p>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3">
              <CheckIcon className="text-accent" />
              <span>무제한 대본 생성</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckIcon className="text-accent" />
              <span>썸네일 문구 추천</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckIcon className="text-accent" />
              <span>해시태그 자동 생성</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckIcon className="text-accent" />
              <span>히스토리 30개 저장</span>
            </li>
          </ul>
          <button 
            onClick={() => handlePayment("standard", 9900, "숏폼메이커 스탠다드")}
            className="w-full py-4 rounded-xl bg-accent text-bg hover:bg-accent2 transition-colors font-bold text-lg shadow-md shadow-accent/20 hover:shadow-accent/40"
          >
            시작하기
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-card rounded-2xl p-8 border border-border flex flex-col transition-transform hover:-translate-y-1 hover:shadow-lg">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-2">프로 플랜</h3>
            <div className="text-4xl font-bold mb-2">19,900원<span className="text-lg text-text2 font-normal"> / 월</span></div>
            <p className="text-text2">전문적인 채널 운영을 위해</p>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3">
              <CheckIcon className="text-accent" />
              <span>스탠다드 전체 포함</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckIcon className="text-accent" />
              <span>히스토리 무제한 저장</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckIcon className="text-accent" />
              <span>대본 톤 원클릭 재생성</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckIcon className="text-accent" />
              <span>말투 커스텀 저장</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckIcon className="text-accent" />
              <span>우선 고객 지원</span>
            </li>
          </ul>
          <button 
            onClick={() => handlePayment("pro", 19900, "숏폼메이커 프로")}
            className="w-full py-4 rounded-xl bg-border hover:bg-border2 transition-colors font-medium text-text1"
          >
            시작하기
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-10 text-center">자주 묻는 질문</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="bg-card rounded-xl border border-border overflow-hidden transition-all duration-200 hover:border-border2"
            >
              <button 
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-bg3 transition-colors outline-none"
                onClick={() => toggleFaq(idx)}
              >
                <span className="font-semibold text-lg pr-4">{faq.q}</span>
                <ChevronDownIcon className="text-text2 flex-shrink-0" expanded={openFaq === idx} />
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openFaq === idx ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-text2 px-6 pb-6 pt-2 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
