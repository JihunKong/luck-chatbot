export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          사주·운세 카카오톡 챗봇
        </h1>
        <div className="text-center">
          <p className="text-lg mb-4">
            이 페이지는 API 서버용입니다.
          </p>
          <p className="text-gray-600">
            카카오톡에서 챗봇을 추가하여 사용해주세요.
          </p>
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">API 상태</h2>
            <p className="text-green-600">✅ 서버 정상 작동 중</p>
          </div>
        </div>
      </div>
    </main>
  )
}