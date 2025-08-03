// 카카오톡 챗봇 요청/응답 타입 정의

// 사용자 정보
export interface KakaoUser {
  id: string;
  type: string;
  properties?: {
    [key: string]: any;
  };
}

// 카카오톡 요청 형식
export interface KakaoRequest {
  userRequest: {
    timezone: string;
    params?: {
      [key: string]: string;
    };
    block?: {
      id: string;
      name: string;
    };
    utterance: string;  // 사용자가 입력한 메시지
    lang: string;
    user: KakaoUser;
  };
  contexts?: any[];
  bot?: {
    id: string;
    name: string;
  };
  action?: {
    name: string;
    clientExtra?: any;
    params?: {
      [key: string]: string;
    };
    id: string;
    detailParams?: {
      [key: string]: any;
    };
  };
}

// 카카오톡 응답 형식
export interface KakaoResponse {
  version: string;
  template: {
    outputs: Array<SimpleText | SimpleImage | BasicCard | Carousel>;
    quickReplies?: QuickReply[];
  };
  context?: {
    values?: Array<{
      name: string;
      lifeSpan: number;
      params?: {
        [key: string]: any;
      };
    }>;
  };
  data?: {
    [key: string]: any;
  };
}

// 간단한 텍스트 응답
export interface SimpleText {
  simpleText: {
    text: string;
  };
}

// 간단한 이미지 응답
export interface SimpleImage {
  simpleImage: {
    imageUrl: string;
    altText: string;
  };
}

// 기본 카드 응답
export interface BasicCard {
  basicCard: {
    title?: string;
    description?: string;
    thumbnail?: {
      imageUrl: string;
      link?: {
        web?: string;
        mobile?: string;
      };
    };
    buttons?: Array<{
      action: 'webLink' | 'message' | 'phone' | 'share';
      label: string;
      webLinkUrl?: string;
      messageText?: string;
      phoneNumber?: string;
    }>;
  };
}

// 캐러셀 응답
export interface Carousel {
  carousel: {
    type: 'basicCard' | 'commerceCard' | 'listCard';
    items: Array<any>;
  };
}

// 빠른 답변
export interface QuickReply {
  messageText: string;
  action: 'message' | 'block';
  label: string;
  blockId?: string;
}