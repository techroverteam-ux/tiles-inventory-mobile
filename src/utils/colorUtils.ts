/**
 * Converts any CSS color (hsl, rgb, hex) to rgba with the given opacity.
 * Fixes the broken `${color}20` pattern used with hsl theme colors.
 */
export const withOpacity = (color: string, opacity: number): string => {
  if (!color) return `rgba(0,0,0,${opacity})`
  if (color.startsWith('hsla(')) return color.replace(/[\d.]+\)$/, `${opacity})`)
  if (color.startsWith('hsl(')) return color.replace('hsl(', 'hsla(').replace(')', `, ${opacity})`)
  if (color.startsWith('rgba(')) return color.replace(/[\d.]+\)$/, `${opacity})`)
  if (color.startsWith('rgb(')) return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`)
  if (color.startsWith('#') && color.length === 7) {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }
  return color
}
