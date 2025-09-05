// 서버 사이드 전용 유틸리티 함수 (use server 아님)

export function detectLanguage(trackName: string, artistName: string): string {
  // 한글 문자 포함 여부 체크
  const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
  
  if (koreanRegex.test(trackName) || koreanRegex.test(artistName)) {
    return 'ko';
  }
  
  // 일본어 문자 체크
  const japaneseRegex = /[ひらがなカタカナ一-龯]/;
  if (japaneseRegex.test(trackName) || japaneseRegex.test(artistName)) {
    return 'ja';
  }
  
  return 'en'; // 기본값
}

export function isKoreanArtist(artistName: string): boolean {
  // 한국 아티스트명 패턴 (한글 포함 또는 알려진 K-POP 아티스트)
  const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
  
  const knownKPopArtists = [
    'BTS', 'BLACKPINK', 'TWICE', 'Red Velvet', 'SEVENTEEN', 'ITZY', 
    'aespa', 'NewJeans', 'IVE', 'NMIXX', 'STRAY KIDS', 'TXT', 'ENHYPEN',
    'BIGBANG', 'SUPER JUNIOR', 'Girls Generation', 'SHINee', 'EXO',
    'MAMAMOO', 'GFRIEND', 'OH MY GIRL', 'APINK', 'IU', 'TAEYEON'
  ];
  
  return koreanRegex.test(artistName) || 
         knownKPopArtists.some(artist => 
           artistName.toLowerCase().includes(artist.toLowerCase())
         );
}