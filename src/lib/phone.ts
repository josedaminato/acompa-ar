/** Dígitos para wa.me (sin + ni espacios). */
export function phoneToWhatsAppDigits(phone: string): string {
  return phone.replace(/\D/g, '')
}

export function whatsAppUrl(phone: string, message: string): string {
  const digits = phoneToWhatsAppDigits(phone)
  if (!digits) return '#'
  const text = encodeURIComponent(message)
  return `https://wa.me/${digits}?text=${text}`
}
