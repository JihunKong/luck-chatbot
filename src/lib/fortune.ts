import { generateFortune, FortuneType } from './openai';
import { 
  getOrCreateUser, 
  saveConversation, 
  getCachedFortune, 
  saveCachedFortune 
} from './supabase';
import { 
  getZodiacAnimal, 
  getZodiacSign, 
  calculateKoreanAge 
} from './time';

// 운세 타입 판별
export function detectFortuneType(message: string): FortuneType {
  if (message.includes('오늘') || message.includes('일일') || message.includes('데일리')) {
    return 'daily';
  }
  if (message.includes('이번달') || message.includes('월간') || message.includes('이번 달')) {
    return 'monthly';
  }
  if (message.includes('올해') || message.includes('연간') || message.includes('년간')) {
    return 'yearly';
  }
  if (message.includes('평생') || message.includes('인생') || message.includes('사주')) {
    return 'lifetime';
  }
  
  // 기본값은 일일 운세
  return 'daily';
}

// 통합 운세 처리 함수
export async function processFortuneRequest(
  kakaoUserId: string,
  message: string,
  birthDate: string,
  birthTime?: string
): Promise<string> {
  try {
    // 1. 사용자 조회/생성
    const user = await getOrCreateUser(kakaoUserId, birthDate, birthTime);
    
    if (!user) {
      return '사용자 정보를 저장할 수 없습니다. 다시 시도해주세요.';
    }
    
    // 2. 운세 타입 판별
    const fortuneType = detectFortuneType(message);
    
    // 3. 캐시된 운세 확인
    const cachedFortune = await getCachedFortune(user.id, fortuneType);
    
    let fortuneContent: string;
    
    if (cachedFortune) {
      // 캐시된 운세 사용
      fortuneContent = cachedFortune + '\n\n📌 이전에 조회한 운세입니다.';
    } else {
      // 4. 새로운 운세 생성
      const birthInfo = await enrichBirthInfo(birthDate, birthTime);
      
      fortuneContent = await generateFortune(
        birthDate,
        birthTime,
        fortuneType
      );
      
      // 생년월일 정보 추가
      fortuneContent = `${birthInfo}\n\n${fortuneContent}`;
      
      // 5. 캐시에 저장
      await saveCachedFortune(user.id, fortuneType, fortuneContent);
    }
    
    // 6. 대화 기록 저장
    await saveConversation(
      user.id,
      message,
      fortuneContent,
      fortuneType
    );
    
    return fortuneContent;
    
  } catch (error) {
    console.error('Fortune processing error:', error);
    return '운세 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }
}

// 생년월일 정보 보강
async function enrichBirthInfo(
  birthDate: string,
  birthTime?: string
): Promise<string> {
  const date = new Date(birthDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const zodiacAnimal = getZodiacAnimal(year);
  const zodiacSign = getZodiacSign(month, day);
  const koreanAge = calculateKoreanAge(birthDate);
  
  let info = `📅 ${year}년 ${month}월 ${day}일생`;
  
  if (birthTime) {
    info += ` ${birthTime}시`;
  }
  
  info += `\n🐾 ${zodiacAnimal} | ⭐ ${zodiacSign} | 🎂 한국나이 ${koreanAge}세`;
  
  return info;
}

// 빠른 답변 생성
export function generateQuickReplies(fortuneType: FortuneType): Array<{
  messageText: string;
  action: 'message';
  label: string;
}> {
  const baseReplies = [
    {
      messageText: '오늘의 운세',
      action: 'message' as const,
      label: '오늘 운세'
    },
    {
      messageText: '이번 달 운세',
      action: 'message' as const,
      label: '월간 운세'
    },
    {
      messageText: '올해 운세',
      action: 'message' as const,
      label: '연간 운세'
    }
  ];
  
  // 현재 조회한 운세 타입은 제외
  return baseReplies.filter(reply => {
    if (fortuneType === 'daily' && reply.label === '오늘 운세') return false;
    if (fortuneType === 'monthly' && reply.label === '월간 운세') return false;
    if (fortuneType === 'yearly' && reply.label === '연간 운세') return false;
    return true;
  });
}