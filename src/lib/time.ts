import axios from 'axios';

// WorldTimeAPI를 사용하여 현재 한국 시간 가져오기
export async function getCurrentKoreanTime(): Promise<Date> {
  try {
    const response = await axios.get('https://worldtimeapi.org/api/timezone/Asia/Seoul');
    return new Date(response.data.datetime);
  } catch (error) {
    console.error('WorldTimeAPI error:', error);
    // 에러 시 서버 시간 사용
    return new Date();
  }
}

// 음력 변환 (간단한 근사값 - 실제로는 더 복잡한 계산 필요)
export function toLunarDate(solarDate: Date): string {
  // 실제 음력 변환은 매우 복잡하므로, 
  // 프로덕션에서는 전문 라이브러리 사용을 권장합니다
  // 예: korean-lunar-calendar 패키지
  
  const year = solarDate.getFullYear();
  const month = solarDate.getMonth() + 1;
  const day = solarDate.getDate();
  
  // 간단한 표시용
  return `양력 ${year}년 ${month}월 ${day}일`;
}

// 띠 계산
export function getZodiacAnimal(birthYear: number): string {
  const animals = [
    '원숭이', '닭', '개', '돼지', 
    '쥐', '소', '호랑이', '토끼', 
    '용', '뱀', '말', '양'
  ];
  
  return animals[birthYear % 12] + '띠';
}

// 별자리 계산
export function getZodiacSign(birthMonth: number, birthDay: number): string {
  const signs = [
    { name: '염소자리', start: [12, 22], end: [1, 19] },
    { name: '물병자리', start: [1, 20], end: [2, 18] },
    { name: '물고기자리', start: [2, 19], end: [3, 20] },
    { name: '양자리', start: [3, 21], end: [4, 19] },
    { name: '황소자리', start: [4, 20], end: [5, 20] },
    { name: '쌍둥이자리', start: [5, 21], end: [6, 20] },
    { name: '게자리', start: [6, 21], end: [7, 22] },
    { name: '사자자리', start: [7, 23], end: [8, 22] },
    { name: '처녀자리', start: [8, 23], end: [9, 22] },
    { name: '천칭자리', start: [9, 23], end: [10, 22] },
    { name: '전갈자리', start: [10, 23], end: [11, 21] },
    { name: '사수자리', start: [11, 22], end: [12, 21] }
  ];
  
  for (const sign of signs) {
    const [startMonth, startDay] = sign.start;
    const [endMonth, endDay] = sign.end;
    
    if (startMonth === 12) {
      // 연말연초 처리
      if ((birthMonth === 12 && birthDay >= startDay) || 
          (birthMonth === 1 && birthDay <= endDay)) {
        return sign.name;
      }
    } else {
      if ((birthMonth === startMonth && birthDay >= startDay) ||
          (birthMonth === endMonth && birthDay <= endDay) ||
          (birthMonth > startMonth && birthMonth < endMonth)) {
        return sign.name;
      }
    }
  }
  
  return '알 수 없음';
}

// 나이 계산 (한국식)
export function calculateKoreanAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  
  // 한국 나이 = 현재년도 - 출생년도 + 1
  return today.getFullYear() - birth.getFullYear() + 1;
}

// 만 나이 계산
export function calculateInternationalAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}