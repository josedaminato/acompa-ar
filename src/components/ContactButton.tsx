import { whatsAppUrl } from '../lib/phone'

type Props = {
  name: string
  phone: string
  message: string
}

export function ContactButton({ name, phone, message }: Props) {
  const href = whatsAppUrl(phone, message)
  const disabled = href === '#'

  return (
    <a
      href={disabled ? undefined : href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex min-h-12 w-full items-center justify-center rounded-2xl px-4 py-3 text-center font-medium no-underline ${
        disabled
          ? 'cursor-not-allowed bg-sage-light/50 text-ink-muted'
          : 'bg-[#25D366] text-white'
      }`}
      onClick={(e) => {
        if (disabled) e.preventDefault()
      }}
    >
      Enviar WhatsApp a {name}
    </a>
  )
}
