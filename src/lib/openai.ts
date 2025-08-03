import OpenAI from 'openai';

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 운세 타입 정의
export type FortuneType = 'daily' | 'monthly' | 'yearly' | 'lifetime';

// 운세 생성 함수
export async function generateFortune(
  birthDate: string,
  birthTime: string | undefined,
  fortuneType: FortuneType = 'daily'
): Promise<string> {
  try {
    // 현재 날짜 가져오기
    const today = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
    
    // 프롬프트 생성
    const prompt = createFortunePrompt(birthDate, birthTime, fortuneType, today);
    
    // OpenAI API 호출 (gpt-4o-mini 모델 사용)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `당신은 한국의 유명한 사주 전문가이자 운세 상담사입니다. 
          동양 철학과 사주팔자, 주역을 깊이 이해하고 있으며, 
          따뜻하고 긍정적인 조언을 제공합니다. 
          모든 응답은 한국어로 작성하며, 이모지를 적절히 사용하여 친근하게 대답합니다.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.8,
      presence_penalty: 0.3,
      frequency_penalty: 0.3,
    });
    
    return completion.choices[0].message.content || '운세를 생성할 수 없습니다.';
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // 에러 발생 시 기본 메시지 반환
    return getFallbackFortune(fortuneType);
  }
}

// 프롬프트 생성 함수
function createFortunePrompt(
  birthDate: string,
  birthTime: string | undefined,
  fortuneType: FortuneType,
  today: string
): string {
  const birthInfo = birthTime 
    ? `생년월일: ${birthDate}, 생시: ${birthTime}` 
    : `생년월일: ${birthDate}`;
  
  const prompts: Record<FortuneType, string> = {
    daily: `${birthInfo}인 사람의 ${today} 오늘 운세를 알려주세요.
    
    다음 항목들을 포함해주세요:
    1. 🌅 종합운: 오늘의 전반적인 운세
    2. 💼 직장/학업운: 업무나 공부 관련 조언
    3. 💕 애정운: 연애나 인간관계 조언
    4. 💰 금전운: 재물 관련 조언
    5. 🍀 행운의 숫자와 색상
    6. ⚠️ 주의사항
    
    긍정적이고 희망적인 톤으로 작성해주세요.`,
    
    monthly: `${birthInfo}인 사람의 이번 달 운세를 알려주세요.
    
    다음 항목들을 포함해주세요:
    1. 📅 이번 달 전체 운세
    2. 🌟 중요한 시기와 기회
    3. 💡 이번 달 집중해야 할 분야
    4. 🎯 목표 달성을 위한 조언
    5. 🍀 행운의 날짜
    
    구체적이고 실용적인 조언을 포함해주세요.`,
    
    yearly: `${birthInfo}인 사람의 올해 연간 운세를 알려주세요.
    
    다음 항목들을 포함해주세요:
    1. 🎊 올해의 전반적인 운세
    2. 📈 상반기/하반기 운세 흐름
    3. 🎯 올해 이룰 수 있는 성과
    4. ⚠️ 주의해야 할 시기
    5. 🌈 올해의 테마와 조언
    
    장기적인 관점에서 조언해주세요.`,
    
    lifetime: `${birthInfo}인 사람의 타고난 사주와 평생 운세를 알려주세요.
    
    다음 항목들을 포함해주세요:
    1. 🌟 타고난 성격과 기질
    2. 💪 강점과 재능
    3. 🎯 인생의 방향성
    4. 💑 인연과 관계
    5. 💼 적합한 직업이나 분야
    6. 🍀 인생 조언
    
    깊이 있고 통찰력 있는 분석을 제공해주세요.`
  };
  
  return prompts[fortuneType];
}

// 폴백 운세 (API 에러 시)
function getFallbackFortune(fortuneType: FortuneType): string {
  const fallbacks: Record<FortuneType, string> = {
    daily: `🔮 오늘의 운세

오늘은 새로운 시작을 위한 좋은 날입니다.
긍정적인 마음가짐으로 하루를 시작하세요.

• 행운의 숫자: 3, 7
• 행운의 색상: 파란색
• 조언: 주변 사람들과의 소통을 늘려보세요.`,
    
    monthly: `📅 이번 달 운세

이번 달은 도약의 시기입니다.
그동안 준비해온 일들이 결실을 맺을 수 있습니다.

• 중요 시기: 중순
• 집중 분야: 인간관계
• 조언: 꾸준함이 성공의 열쇠입니다.`,
    
    yearly: `🎊 올해 운세

올해는 변화와 성장의 해입니다.
새로운 도전을 두려워하지 마세요.

• 상반기: 준비와 계획
• 하반기: 실행과 성과
• 조언: 건강 관리에 신경 쓰세요.`,
    
    lifetime: `🌟 평생 운세

당신은 타고난 리더십과 창의성을 가지고 있습니다.
인생의 중요한 전환점에서 올바른 선택을 하게 될 것입니다.

• 강점: 직관력과 판단력
• 적합 분야: 창의적인 일
• 조언: 자신을 믿고 나아가세요.`
  };
  
  return fallbacks[fortuneType] + '\n\n⚠️ 일시적인 연결 문제로 간단한 운세를 제공했습니다.';
}