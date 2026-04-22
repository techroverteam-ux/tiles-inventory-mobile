export interface GlobalSearchResult {
  type: string
  label: string
  subtitle?: string
  href: string
}

export interface GlobalSearchResponse {
  results: GlobalSearchResult[]
  total: number
}

export const globalSearchService = {
  search: async (query: string): Promise<GlobalSearchResponse> => {
    // Mock implementation - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const mockResults: GlobalSearchResult[] = [
      {
        type: 'Product',
        label: `Ceramic Tile ${query}`,
        subtitle: 'Floor Tile - 24x24',
        href: '/products/1',
      },
      {
        type: 'Brand',
        label: `${query} Brand`,
        subtitle: '15 products available',
        href: '/brands/1',
      },
      {
        type: 'Category',
        label: `${query} Category`,
        subtitle: '8 products in this category',
        href: '/categories/1',
      },
    ]

    return {
      results: mockResults.filter(result => 
        result.label.toLowerCase().includes(query.toLowerCase())
      ),
      total: mockResults.length,
    }
  },
}