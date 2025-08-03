import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 데이터베이스 타입 정의
export interface User {
  id: string;
  kakao_user_key: string;
  birth_date: string;
  birth_time?: string;
  zodiac_animal?: string;
  zodiac_sign?: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  message: string;
  response: string;
  fortune_type?: string;
  created_at: string;
}

export interface FortuneCache {
  id: string;
  user_id: string;
  fortune_type: string;
  content: string;
  expires_at: string;
  created_at: string;
}

// 사용자 관련 함수들
export async function getOrCreateUser(
  kakaoUserKey: string,
  birthDate?: string,
  birthTime?: string
): Promise<User | null> {
  try {
    // 기존 사용자 조회
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('kakao_user_key', kakaoUserKey)
      .single();
    
    if (existingUser && !fetchError) {
      // 생년월일 정보 업데이트 (있는 경우)
      if (birthDate && existingUser.birth_date !== birthDate) {
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            birth_date: birthDate,
            birth_time: birthTime,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id)
          .select()
          .single();
        
        if (updateError) {
          console.error('User update error:', updateError);
          return existingUser;
        }
        
        return updatedUser;
      }
      
      return existingUser;
    }
    
    // 새 사용자 생성
    if (birthDate) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          kakao_user_key: kakaoUserKey,
          birth_date: birthDate,
          birth_time: birthTime,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        console.error('User creation error:', createError);
        return null;
      }
      
      return newUser;
    }
    
    return null;
  } catch (error) {
    console.error('Database error:', error);
    return null;
  }
}

// 대화 기록 저장
export async function saveConversation(
  userId: string,
  message: string,
  response: string,
  fortuneType?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        message,
        response,
        fortune_type: fortuneType,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Conversation save error:', error);
    }
  } catch (error) {
    console.error('Database error:', error);
  }
}

// 최근 대화 기록 조회
export async function getRecentConversations(
  userId: string,
  limit: number = 10
): Promise<Conversation[]> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Conversation fetch error:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Database error:', error);
    return [];
  }
}

// 운세 캐시 조회
export async function getCachedFortune(
  userId: string,
  fortuneType: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('fortune_cache')
      .select('content, expires_at')
      .eq('user_id', userId)
      .eq('fortune_type', fortuneType)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    // 만료 시간 확인
    const expiresAt = new Date(data.expires_at);
    if (expiresAt < new Date()) {
      // 만료된 캐시 삭제
      await supabase
        .from('fortune_cache')
        .delete()
        .eq('user_id', userId)
        .eq('fortune_type', fortuneType);
      
      return null;
    }
    
    return data.content;
  } catch (error) {
    console.error('Cache fetch error:', error);
    return null;
  }
}

// 운세 캐시 저장
export async function saveCachedFortune(
  userId: string,
  fortuneType: string,
  content: string
): Promise<void> {
  try {
    // 캐시 만료 시간 설정 (일일 운세는 1일, 월간은 7일, 연간은 30일)
    const expirationHours = {
      daily: 24,
      monthly: 24 * 7,
      yearly: 24 * 30,
      lifetime: 24 * 365
    };
    
    const hours = expirationHours[fortuneType as keyof typeof expirationHours] || 24;
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
    
    // 기존 캐시 삭제
    await supabase
      .from('fortune_cache')
      .delete()
      .eq('user_id', userId)
      .eq('fortune_type', fortuneType);
    
    // 새 캐시 저장
    const { error } = await supabase
      .from('fortune_cache')
      .insert({
        user_id: userId,
        fortune_type: fortuneType,
        content,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Cache save error:', error);
    }
  } catch (error) {
    console.error('Database error:', error);
  }
}