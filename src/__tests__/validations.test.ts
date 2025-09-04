import {
  createPackSchema,
  calculateTotalSize,
  formatFileSize,
  getCapacityInMB,
  isCapacityExceeded,
  getContentKindLabel,
  generateShareUrl,
  generateOgImageUrl,
} from '@/lib/validations'

describe('Validation Functions', () => {
  describe('createPackSchema', () => {
    it('should validate a correct pack creation data', () => {
      const validData = {
        name: '테스트 미디어팩',
        message: '테스트 메시지입니다',
        selectedContentIds: ['1', '2', '3'],
      }

      const result = createPackSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should fail validation for empty name', () => {
      const invalidData = {
        name: '',
        message: '테스트 메시지입니다',
        selectedContentIds: ['1', '2', '3'],
      }

      const result = createPackSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('필수')
      }
    })

    it('should fail validation for name longer than 20 characters', () => {
      const invalidData = {
        name: '이것은 20자를 초과하는 매우 긴 이름입니다',
        message: '테스트 메시지입니다',
        selectedContentIds: ['1', '2', '3'],
      }

      const result = createPackSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('20자')
      }
    })

    it('should fail validation for message longer than 50 characters', () => {
      const invalidData = {
        name: '테스트',
        message: '이것은 50자를 초과하는 매우 긴 메시지입니다. 정말 매우 매우 긴 메시지입니다. 더 긴 메시지를 만들어보겠습니다.',
        selectedContentIds: ['1', '2', '3'],
      }

      const result = createPackSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('50자')
      }
    })

    it('should fail validation for less than 3 content items', () => {
      const invalidData = {
        name: '테스트',
        message: '테스트 메시지',
        selectedContentIds: ['1', '2'],
      }

      const result = createPackSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('최소 3개')
      }
    })
  })

  describe('calculateTotalSize', () => {
    it('should calculate total size correctly', () => {
      const contents = [
        { size_mb: 100 },
        { size_mb: 200 },
        { size_mb: 300 },
      ]

      const total = calculateTotalSize(contents)
      expect(total).toBe(600)
    })

    it('should return 0 for empty array', () => {
      const total = calculateTotalSize([])
      expect(total).toBe(0)
    })
  })

  describe('formatFileSize', () => {
    it('should format MB correctly', () => {
      expect(formatFileSize(500)).toBe('500MB')
      expect(formatFileSize(999)).toBe('999MB')
    })

    it('should format GB correctly', () => {
      expect(formatFileSize(1024)).toBe('1.0GB')
      expect(formatFileSize(1536)).toBe('1.5GB')
      expect(formatFileSize(2048)).toBe('2.0GB')
    })
  })

  describe('getCapacityInMB', () => {
    it('should convert GB to MB correctly', () => {
      expect(getCapacityInMB('16')).toBe(16384)
      expect(getCapacityInMB('32')).toBe(32768)
    })
  })

  describe('isCapacityExceeded', () => {
    it('should return true when capacity is exceeded', () => {
      expect(isCapacityExceeded(20000, '16')).toBe(true)
      expect(isCapacityExceeded(40000, '32')).toBe(true)
    })

    it('should return false when capacity is not exceeded', () => {
      expect(isCapacityExceeded(10000, '16')).toBe(false)
      expect(isCapacityExceeded(30000, '32')).toBe(false)
    })
  })

  describe('getContentKindLabel', () => {
    it('should return correct Korean labels', () => {
      expect(getContentKindLabel('movie')).toBe('영화')
      expect(getContentKindLabel('drama')).toBe('드라마')
      expect(getContentKindLabel('show')).toBe('예능')
      expect(getContentKindLabel('kpop')).toBe('K-POP')
      expect(getContentKindLabel('doc')).toBe('다큐멘터리')
    })
  })

  describe('generateShareUrl', () => {
    it('should generate correct share URL', () => {
      const baseUrl = 'https://example.com'
      const slug = 'abc123'
      const result = generateShareUrl(baseUrl, slug)
      expect(result).toBe('https://example.com/pack/abc123')
    })
  })

  describe('generateOgImageUrl', () => {
    it('should generate correct OG image URL', () => {
      const baseUrl = 'https://example.com'
      const slug = 'abc123'
      const result = generateOgImageUrl(baseUrl, slug)
      expect(result).toBe('https://example.com/api/og?slug=abc123')
    })
  })
})