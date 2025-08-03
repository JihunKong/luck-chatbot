import { NextRequest, NextResponse } from 'next/server';
import { KakaoRequest, KakaoResponse, SimpleText } from '@/types/kakao';
import { processFortuneRequest, detectFortuneType, generateQuickReplies } from '@/lib/fortune';
import { getOrCreateUser } from '@/lib/supabase';

// 생년월일 형식 검증 (YYYY-MM-DD)
function isValidBirthDate(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // 날짜 유효성 검증
  if (year < 1900 || year > new Date().getFullYear()) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  return true;
}

// 생시 형식 검증 (HH:mm)
function isValidBirthTime(timeStr: string): boolean {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(timeStr);
}

// 사용자 입력 파싱
function parseUserInput(utterance: string): {
  birthDate?: string;
  birthTime?: string;
  isValid: boolean;
  errorMessage?: string;
} {
  // 입력 예시: "생년월일: 1990-01-01, 생시: 14:30"
  // 또는 "1990-01-01 14:30"
  // 또는 "19900101"
  
  let birthDate: string | undefined;
  let birthTime: string | undefined;
  
  // 생년월일 추출
  const dateMatch = utterance.match(/(\d{4})[-\/년]?(\d{1,2})[-\/월]?(\d{1,2})/);
  if (dateMatch) {
    const year = dateMatch[1];
    const month = dateMatch[2].padStart(2, '0');
    const day = dateMatch[3].padStart(2, '0');
    birthDate = `${year}-${month}-${day}`;
  }
  
  // 생시 추출
  const timeMatch = utterance.match(/(\d{1,2})[시:](\d{2})/);
  if (timeMatch) {
    const hour = timeMatch[1].padStart(2, '0');
    const minute = timeMatch[2];
    birthTime = `${hour}:${minute}`;
  }
  
  // 유효성 검증
  if (!birthDate) {
    return {
      isValid: false,
      errorMessage: '생년월일을 입력해주세요.\n예시: 1990-01-01 또는 19900101'
    };
  }
  
  if (!isValidBirthDate(birthDate)) {
    return {
      isValid: false,
      errorMessage: '올바른 생년월일 형식이 아닙니다.\n예시: 1990-01-01'
    };
  }
  
  return {
    birthDate,
    birthTime,
    isValid: true
  };
}

// POST 요청 처리 (카카오톡 웹훅)
export async function POST(request: NextRequest) {
  try {
    const body: KakaoRequest = await request.json();
    
    // 사용자 메시지 추출
    const userMessage = body.userRequest.utterance;
    const userId = body.userRequest.user.id;
    
    console.log(`[${new Date().toISOString()}] User ${userId}: ${userMessage}`);
    
    // 응답 초기화
    let responseText = '';
    let quickReplies = undefined;
    
    // 인사말 처리
    if (userMessage.includes('안녕') || userMessage.includes('시작')) {
      responseText = `안녕하세요! 사주·운세 챗봇입니다. 🔮

생년월일과 생시를 알려주시면 오늘의 운세를 알려드릴게요.

📝 입력 예시:
• 1990년 1월 1일 14시 30분
• 1990-01-01 14:30
• 19900101

생시를 모르시면 생년월일만 입력하셔도 됩니다!`;
      
      quickReplies = [
        {
          messageText: '예시: 1990-01-01 14:30',
          action: 'message' as const,
          label: '입력 예시 보기'
        }
      ];
    } 
    // 도움말 처리
    else if (userMessage.includes('도움') || userMessage.includes('help')) {
      responseText = `📚 사용 방법 안내

1️⃣ 생년월일 입력하기
   • YYYY-MM-DD 형식 (예: 1990-01-01)
   • YYYYMMDD 형식 (예: 19900101)
   • YYYY년 MM월 DD일 형식

2️⃣ 생시 입력하기 (선택사항)
   • HH:MM 형식 (예: 14:30)
   • HH시 MM분 형식

3️⃣ 운세 종류
   • 오늘의 운세
   • 이번 달 운세
   • 올해 운세
   • 평생 사주

궁금한 점이 있으시면 언제든 물어보세요!`;
    }
    // 운세 요청 처리
    else {
      // 먼저 기존 사용자인지 확인
      const existingUser = await getOrCreateUser(userId);
      
      // 기존 사용자이고 운세 타입 요청인 경우
      if (existingUser && existingUser.birth_date && 
          (userMessage.includes('운세') || userMessage.includes('사주'))) {
        
        // 기존 사용자의 생년월일로 운세 생성
        responseText = await processFortuneRequest(
          userId,
          userMessage,
          existingUser.birth_date,
          existingUser.birth_time || undefined
        );
        
        const fortuneType = detectFortuneType(userMessage);
        quickReplies = generateQuickReplies(fortuneType);
      } 
      // 새로운 생년월일 입력 처리
      else {
        const parseResult = parseUserInput(userMessage);
        
        if (!parseResult.isValid) {
          responseText = parseResult.errorMessage || '입력 형식을 확인해주세요.';
          quickReplies = [
            {
              messageText: '도움말',
              action: 'message' as const,
              label: '사용 방법 보기'
            }
          ];
        } else {
          // OpenAI를 사용한 실제 운세 생성
          responseText = await processFortuneRequest(
            userId,
            userMessage,
            parseResult.birthDate!,
            parseResult.birthTime
          );
          
          const fortuneType = detectFortuneType(userMessage);
          quickReplies = generateQuickReplies(fortuneType);
        }
      }
    }
    
    // 카카오톡 응답 형식
    const response: KakaoResponse = {
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: responseText
            }
          } as SimpleText
        ],
        quickReplies
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Webhook error:', error);
    
    // 에러 응답
    const errorResponse: KakaoResponse = {
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: '죄송합니다. 일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.'
            }
          } as SimpleText
        ]
      }
    };
    
    return NextResponse.json(errorResponse);
  }
}